# EvAPI — État d'avancement (cahier de suivi)

Document de référence pour savoir où en est le projet et par où reprendre.
Mis à jour le 30/07/2026 (session d'architecture backend + PostgreSQL).

---

## 1. Vue d'ensemble

EvAPI est une plateforme SaaS d'audit de sécurité API basée sur l'OWASP API
Security Top 10. Deux dépôts Git séparés cohabitent dans le même dossier local :

| Dépôt | Dossier | Remote GitHub | Contenu |
|-------|---------|----------------|---------|
| **evAPIFront** | racine `apiScanner/` | `goumiryahya-stack/evAPIFront` | Frontend React (`scanner-api/`), docs, docker-compose, workflows n8n |
| **evAPI** | `scanner-api-backend/` | `goumiryahya-stack/evAPI` | Backend FastAPI (dépôt Git imbriqué, indépendant) |

Chacun a son propre historique de commits et se pousse séparément.

---

## 2. Architecture backend (mise à jour cette session)

```
app/
├── routers/            # auth, scans, reports, dashboard, files, integrations
├── repositories/        # User, Scan, Vulnerability — seul point d'accès SQLAlchemy
├── models/, schemas/, core/
└── services/
    ├── scanner/
    │   ├── scan_engine.py       # orchestrateur du scan (OWASP + ZAP)
    │   ├── openapi_parser.py    # NOUVEAU — parse OpenAPI/Swagger
    │   ├── post_scan_tasks.py   # PDF + notification n8n (plus d'IA ici)
    │   └── custom_checks/
    │       └── bola.py          # check BOLA extrait de scan_engine.py
    ├── integrations/
    │   ├── n8n_service.py
    │   └── zap_service.py       # + import_openapi_spec()
    └── reports/
        ├── pdf_service.py
        ├── report_export_service.py
        └── storage_service.py
```

Le routeur `ai.py` et `ai_service.py` ont été **supprimés** (voir section 3).

---

## 3. Décision d'architecture : IA uniquement via n8n

Le backend n'appelle **plus jamais** Ollama directement. L'enrichissement IA
d'un rapport (résumé + recommandations) se fait exclusivement via le workflow
n8n `n8n-workflows/evapi-scan-complete.json`, déclenché automatiquement à la
fin de chaque scan (événement `scan.completed`).

**Ce qui a été retiré :**
- `app/services/ai_service.py`, `app/routers/ai.py` (endpoints `/ai/status`,
  `/ai/reports/{id}/enrich`)
- L'appel `_enrich_with_ai()` dans `post_scan_tasks.py`
- Les settings `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `AI_ENABLED`
- Le bouton **🤖 IA** et les appels `enrichReportWithAi`/`fetchAiStatus` côté
  frontend (`ReportDetailPage.jsx`, `utils/reports.js`)

**Conséquence :** `vuln.ai_recommendation` et `report.executive_summary`
restent dans le modèle de données (colonnes DB) mais ne sont plus jamais
renseignés par le backend — seul un workflow n8n qui écrirait dans la base
pourrait les remplir à l'avenir (non fait, le workflow actuel se contente
d'envoyer sur Slack).

---

## 4. État par fonctionnalité

| Fonctionnalité | Statut | Détail |
|--------|--------|--------|
| Authentification JWT | ✅ | Repository pattern (`UserRepository`) |
| Moteur de scan OWASP | ✅ | HTTPS, headers, CORS, auth, rate limit, BOLA, SQLi, SSRF |
| **Scan piloté par spec OpenAPI/Swagger** | ✅ **Nouveau** | `openapi_parser.py` — JSON/YAML, OpenAPI 3.x + Swagger 2.0, résolution des `{path_params}`, plafond 25 endpoints. Testé en conditions réelles (upload → scan → N endpoints audités individuellement) |
| **OWASP ZAP — import de la spec avant spider** | ✅ **Nouveau** | `zap_service.import_openapi_spec()` — nécessite un daemon ZAP sur la même machine (lit le fichier localement). `ZAP_ENABLED=false` par défaut, non testé contre un vrai daemon ZAP (aucun daemon disponible dans cet environnement) |
| Rapports (export JSON/CSV, import) | ✅ | Repository pattern (`ScanRepository`) |
| Vulnérabilités (filtres, statut) | ✅ | Repository pattern (`VulnerabilityRepository`) |
| Dashboard | ✅ | Agrégations via repositories |
| PDF automatique en fin de scan | 🟡 | Génération échoue silencieusement sur certains scans (`fpdf2: Not enough horizontal space to render a single character`) — bug préexistant, pas corrigé cette session (hors périmètre demandé), scan non bloqué (juste pas de PDF) |
| **n8n — workflow IA + Slack prêt à l'emploi** | ✅ **Nouveau** | `n8n-workflows/evapi-scan-complete.json` (Webhook → Ollama → Set → Slack). JSON valide, schéma n8n correct, **non testé contre une instance n8n réelle** (Docker indisponible dans cet environnement) |
| **PostgreSQL** | ✅ **Basculé et vérifié** | `.env` pointe maintenant sur PostgreSQL (voir section 5) — plus SQLite par défaut |
| Architecture Repository | ✅ | User/Scan/Vulnerability (session précédente) |
| Services réorganisés (scanner/integrations/reports) | ✅ **Nouveau** | Voir section 2 |

---

## 5. PostgreSQL — comment ça a été fait ici (pas de Docker disponible)

Docker n'est pas installé sur cette machine et son installation demande des
étapes manuelles (droits admin, WSL2, redémarrage, écrans graphiques) que je
ne peux pas exécuter seul. **Un service PostgreSQL 18 natif Windows tournait
déjà** sur la machine — on l'a utilisé à la place du conteneur Docker prévu
dans `docker-compose.yml` :

- Base `evapi`, rôle `evapi` / mot de passe `evapi_secret` (mêmes identifiants
  que ceux déjà documentés pour le conteneur Docker — cohérent si Docker est
  installé plus tard)
- `scanner-api-backend/.env` : `DATABASE_URL=postgresql+psycopg2://evapi:evapi_secret@localhost:5432/evapi`
- `alembic upgrade head` exécuté (no-op sur base vierge : la seule migration
  existante ne fait qu'ajouter une colonne si la table existe déjà)
- Schéma réellement créé par `create_tables()` au démarrage de l'app (comme en
  SQLite — voir `app/main.py`, commentaire "create_tables : dev uniquement —
  en prod préférer Alembic". Alembic ne gère ici qu'un delta, pas la création
  initiale)
- Vérifié en conditions réelles : login, dashboard, création/exécution
  complète d'un scan (8 checks), rapports, vulnérabilités — tout fonctionne
  identiquement à SQLite
- Suite de tests (13/13) rejouée avec cette configuration (les tests actuels
  ne touchent pas la DB directement, donc ce n'est pas un test d'intégration
  DB à proprement parler)

**Pour revenir à SQLite** (dev rapide, pas de service à faire tourner) :
remettre `DATABASE_URL=sqlite:///./scanapi.db` dans `.env`.

**Si Docker est installé plus tard** : `docker compose up -d postgres`
pointera vers un conteneur séparé avec les mêmes identifiants — changer
`localhost` en l'hôte du conteneur si besoin, sinon aucun autre changement.

---

## 6. Bugs connus (non corrigés, hors périmètre de cette session)

1. **PDF génération** : `fpdf2` lève parfois `Not enough horizontal space to
   render a single character` pendant `generate_scan_pdf()`
   (`app/services/reports/pdf_service.py`). Capturé par `post_scan_tasks.py`
   (ne bloque pas le scan), mais `pdf_report_path` reste `None`. À
   investiguer : probablement un texte trop long/sans espace pour
   `multi_cell()`.
2. `storage_service.save_upload_file()` retourne un chemin **absolu** malgré
   le commentaire "chemin relatif pour la base de données" — cohérent avec
   l'usage actuel (`get_file_path` revalide de toute façon), mais le
   commentaire est trompeur.

---

## 7. Décisions en attente (à trancher avec toi)

1. **Commit des changements backend de cette session** (dépôt `evAPI`) — pas
   encore fait : suppression IA, réorganisation des services, parser
   OpenAPI, intégration ZAP, tests, bascule PostgreSQL. Tout est vérifié
   fonctionnellement mais rien n'est commité côté backend.
2. **Push** des commits frontend déjà faits (`evAPIFront` — fix
   ProtectedRoute + suppression bouton IA) vers GitHub.
3. **Nettoyage restant** (reporté lors d'une session précédente) : fichiers
   `.jsx` orphelins à la racine, `.venv/` racine, worktree/branche oubliés.
4. **Historique Git de `evAPI`** : `venv/`, `.env`, `scanapi.db` retirés du
   suivi actuel mais toujours visibles dans les anciens commits déjà
   poussés — purge d'historique non faite (aucun vrai secret exposé).

## 8. Prochaines étapes candidates

1. Corriger le bug PDF (`fpdf2`) — actuellement silencieux, donc facile à
   manquer en usage normal.
2. Tester le workflow n8n contre une vraie instance (webhook réel, Ollama
   réel, Slack réel) — actuellement seulement validé structurellement.
3. Tester l'import OpenAPI dans ZAP contre un vrai daemon ZAP.
4. Étendre la couche Repository aux services d'écriture
   (`scan_engine.py`, `post_scan_tasks.py`) si séparation complète voulue.
5. Ajouter des checks BFLA (Broken Function Level Authorization) et Mass
   Assignment dans `custom_checks/` — mentionnés comme prévus mais jamais
   implémentés avant cette session, toujours pas fait (non demandé
   explicitement cette fois).

---

## 9. Démarrer le projet (mis à jour)

```powershell
# Backend — nécessite PostgreSQL actif (service Windows ou Docker)
cd scanner-api-backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend (autre terminal)
cd scanner-api
npm run dev
```

- Backend : http://127.0.0.1:8000/docs
- Frontend : http://localhost:5173
- Compte démo : `demo@evapi.com` / `Demo1234`
- Si le service PostgreSQL natif n'est pas démarré : `Start-Service postgresql-x64-18` (admin requis)
