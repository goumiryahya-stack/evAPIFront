# EvAPI — État d'avancement (cahier de suivi)

Document de référence pour savoir où en est le projet et par où reprendre.
Mis à jour le 30/07/2026 (architecture backend + PostgreSQL + BFLA/Mass
Assignment + fix PDF + nettoyage final). Backend et frontend commités et
poussés — dépôt propre des deux côtés.

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
    │       ├── bola.py                    # API1:2023
    │       ├── bfla_check.py              # API5:2023 — NOUVEAU
    │       └── mass_assignment_check.py   # API3:2023 — NOUVEAU
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
| PDF automatique en fin de scan | ✅ **Corrigé** | La vraie cause n'était pas la longueur du texte : `multi_cell(w=0, ...)` laisse le curseur au bord droit de la page (`new_x=XPos.RIGHT` par défaut dans fpdf2) ; l'appel suivant calculait donc une largeur nulle et échouait instantanément, quel que soit son contenu. Fix : reset `pdf.x` à la marge gauche avant chaque `multi_cell()`. Vérifié par téléchargement réel du PDF généré (200 OK, PDF valide) |
| **BFLA (API5:2023)** | ✅ **Nouveau** | `custom_checks/bfla_check.py` — actif seulement si `ScanCreate.auth` (token d'un rôle restreint sur l'API **cible**) est fourni. Testé en conditions réelles (log "BFLA : 0 finding(s)" sur httpbin.org) |
| **Mass Assignment (API3:2023)** | ✅ **Nouveau** | `custom_checks/mass_assignment_check.py` — même mécanisme `auth`. Testé en conditions réelles |
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

## 6. Nettoyage final (30/07/2026)

Un cahier de charge a circulé affirmant plusieurs incohérences entre l'état
réel du dépôt et cette documentation. Vérification systématique avant
d'agir (fichier par fichier, `ls`/`grep`, pas de suppositions) :

| Point du cahier | Réalité vérifiée | Action |
|---|---|---|
| `app/api/routers/ai.py` à supprimer | N'existe pas (ni ce chemin fictif, ni le vrai `app/routers/ai.py`) — déjà supprimé lors d'une session précédente | ✅ Aucune action nécessaire |
| `app/services/integrations/ai_service.py` à supprimer | N'existe nulle part dans le projet | ✅ Aucune action nécessaire |
| `scanapi.db` obsolète | Existait encore sur disque (déjà gitignoré, jamais suivi) | ✅ Supprimé |
| `.pytest_cache/` à supprimer | Existait sur disque (déjà gitignoré) | ✅ Supprimé |
| `alembic/alembic.code-workspace` égaré | Existait et **était suivi par Git** | ✅ Supprimé + `.gitignore` complété (`.pytest_cache/`, `*.code-workspace`) |
| 8 `.jsx` + `package.json` + `SAUVEGARDE.md` orphelins à la racine du frontend | Existaient toujours (reportés lors d'un nettoyage précédent, jamais sélectionnés) | ✅ Supprimés + lien mort retiré du README |
| **`openapi_parser.py` "manquant"** | **Faux** — existe et fonctionne (testé de bout en bout) | ❌ Pas recréé (aurait écrasé du code testé) |
| **`app/repositories/` "manquant"** | **Faux** — existe avec les 3 repositories | ❌ Pas recréé |
| **`n8n-workflows/evapi-scan-complete.json` "manquant"** | **Faux** — existe dans `evAPIFront/` (racine), comme prévu | ❌ Pas recréé |
| `.gitignore` backend à vérifier | Existait, il manquait juste 2 entrées | ✅ Complété |

**Piège évité** : `git add -A` a failli embarquer le worktree Git oublié
(`scanner-api-backend.worktrees/agents-create-cloud-storage-bucket-function`,
sans rapport avec EvAPI) comme dépôt imbriqué — retiré du staging avant le
commit.

**Vérifications post-nettoyage** (toutes passées) :
- Zéro référence résiduelle à `ai_service`/`ollama_service`/`AI_ENABLED`
- `main.py` et `post_scan_tasks.py` ne référencent plus l'IA
- 23/23 tests passent
- Backend démarre, frontend build sans erreur

Commits : `evAPI` `7dd8e2a`, `evAPIFront` `5cde11a` — poussés.

Les deux petits fixes demandés juste avant (commentaire trompeur dans
`storage_service.py`, `pdf_report_path` exposé dans `ScanResponse`) sont
inclus dans le commit `evAPI` `7dd8e2a`.

---

## 7. Décisions en attente (à trancher avec toi)

1. **`.venv/` à la racine** (doublon Python inutilisé, non suivi par Git) —
   repéré il y a plusieurs sessions, jamais sélectionné pour suppression.
2. **Historique Git de `evAPI`** : `venv/`, `.env`, `scanapi.db` retirés du
   suivi actuel mais toujours visibles dans les anciens commits déjà
   poussés — purge d'historique non faite (aucun vrai secret exposé).

Tout le reste (backend + frontend) est commité **et poussé** sur GitHub.

## 8. Prochaines étapes candidates

1. Tester le workflow n8n contre une vraie instance (webhook réel, Ollama
   réel, Slack réel) — actuellement seulement validé structurellement.
2. Tester l'import OpenAPI dans ZAP et les checks BFLA/Mass Assignment
   contre une vraie API cible avec de vrais rôles/permissions — validés ici
   uniquement contre httpbin.org (pas d'endpoints admin réels à trouver).
3. Étendre la couche Repository aux services d'écriture
   (`scan_engine.py`, `post_scan_tasks.py`) si séparation complète voulue.
4. `ScanCreate.auth` n'est branché que sur `POST /scans` — pas sur le
   déclenchement n8n (`/integrations/n8n/trigger-scan`), non demandé donc
   pas fait.

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
