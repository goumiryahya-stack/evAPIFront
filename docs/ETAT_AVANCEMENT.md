# EvAPI — Cahier de charge : bilan complet du travail effectué

Document de référence unique : tout ce qui a été fait, vérifié, commité et
poussé sur le projet EvAPI, du début à aujourd'hui (30/07/2026). À lire pour
savoir où en est le projet avant de reprendre.

---

## 0. Résumé exécutif

EvAPI est une plateforme SaaS d'audit de sécurité API (OWASP API Security
Top 10) — frontend React + backend FastAPI, deux dépôts Git séparés. Le
socle fonctionnel existait déjà (auth, moteur de scan, rapports, dashboard).
Le travail de cette suite de sessions a porté sur :

1. Hygiène du dépôt Git (fichiers parasites, secrets suivis par erreur)
2. Passage à une architecture Clean/Repository côté backend
3. Vérification réelle de l'application (pas que des tests unitaires)
4. Refonte de l'intégration IA (n8n uniquement, plus d'appel direct à Ollama)
5. Réorganisation des services + nouvelles fonctionnalités (scan piloté par
   spec OpenAPI, checks BFLA/Mass Assignment, import OpenAPI dans ZAP)
6. Bascule PostgreSQL
7. Correction d'un bug de génération PDF présent depuis le début
8. Nettoyage final des fichiers obsolètes

Tout est commité et poussé sur GitHub des deux côtés (`evAPI`, `evAPIFront`).

---

## 1. Architecture des dépôts

| Dépôt | Dossier | Remote GitHub | Contenu |
|-------|---------|----------------|---------|
| **evAPIFront** | racine `apiScanner/` | `goumiryahya-stack/evAPIFront` | Frontend React (`scanner-api/`), docs, docker-compose, `n8n-workflows/` |
| **evAPI** | `scanner-api-backend/` | `goumiryahya-stack/evAPI` | Backend FastAPI (dépôt Git imbriqué, indépendant) |

Chacun a son propre historique de commits et se pousse séparément.

---

## 2. Chronologie des chantiers

### A. Nettoyage initial du dépôt

- Découverte que `scanner-api-backend` est un **second dépôt Git indépendant**
  (remote `evAPI`), imbriqué dans `evAPIFront` — structure intentionnelle,
  pas un accident.
- `scanner-api-backend/.gitignore` créé (n'existait pas du tout) : `.env`,
  `*.db`, `venv/`, `__pycache__/` risquaient d'être commités par erreur.
- Nettoyage des fichiers déjà suivis à tort : `app.zip` (archive redondante),
  `.vscode/` (config IDE triviale) supprimés du dépôt `evAPI`.
- Découverte plus tard, dans une passe plus large : **tout le dossier
  `venv/` (~4900 fichiers), `.env` et `scanapi.db` étaient suivis par Git**
  depuis le "Premier commit" — détachés du suivi (`git rm --cached`), gardés
  sur disque. Le `.env` exposé ne contenait que des valeurs de dev par
  défaut (`SECRET_KEY` placeholder, clés API vides) — aucune vraie fuite de
  secret. L'historique Git ancien les contient toujours (purge non faite,
  demanderait un `git filter-repo` + force-push, jugé disproportionné vu
  l'absence de vrai secret).
- Repéré mais **volontairement non traité** (jamais sélectionné) : un
  worktree Git oublié (`scanner-api-backend.worktrees/agents-create-cloud-
  storage-bucket-function`, sans rapport avec EvAPI), et `.venv/` à la
  racine (doublon Python inutilisé).

### B. Architecture Repository (Clean Architecture)

Les routers (`auth`, `scans`, `reports`, `dashboard`, `files`,
`integrations`) faisaient des `db.query(...)` directement — mélange de la
gestion HTTP et de l'accès aux données. Ajout de `app/repositories/`
(`UserRepository`, `ScanRepository`, `VulnerabilityRepository`) comme seul
point d'accès à chaque table. Les filtres BOLA (`owner_id`) sont
maintenant centralisés dans les repositories plutôt que répétés dans
chaque endpoint. `Report` volontairement laissé de côté (écrit via des
transactions multi-étapes dans les tâches de fond, hors périmètre).

Vérifié en conditions réelles : login, dashboard, création/annulation de
scan, rapports, vulnérabilités — tout fonctionne comme avant le refactor.

### C. Vérification fonctionnelle réelle (/run) + bug frontend trouvé

Backend et frontend lancés en réel (pas juste import/typecheck) : login,
dashboard, création de scan, navigation entre pages, testés via Playwright
headless avec captures d'écran.

**Bug trouvé et corrigé** : `ProtectedRoute.jsx` redirigeait vers `/auth`
avant que la vérification asynchrone du token (`AuthContext.initAuth`) soit
terminée — tout rechargement de page ou lien direct vers une page protégée
déconnectait l'utilisateur, même avec un token valide. Corrigé en attendant
`isLoading` avant de décider.

### D. Refonte majeure : IA via n8n, réorganisation, OpenAPI, ZAP, PostgreSQL

Décision d'architecture (demandée explicitement) : **le backend n'appelle
plus jamais Ollama directement**. Supprimés : `app/services/ai_service.py`,
`app/routers/ai.py` (endpoints `/ai/status`, `/ai/reports/{id}/enrich`),
l'appel `_enrich_with_ai()` dans `post_scan_tasks.py`, les settings
`OLLAMA_BASE_URL`/`OLLAMA_MODEL`/`AI_ENABLED`, et côté frontend le bouton
**🤖 IA** + les appels `enrichReportWithAi`/`fetchAiStatus`. L'IA passe
maintenant exclusivement par le workflow n8n `n8n-workflows/evapi-scan-
complete.json` (Webhook → Ollama → Set → Slack), déclenché automatiquement
à la fin de chaque scan.

Réorganisation de `app/services/` (structure plate → sous-dossiers) :
`scanner/` (scan_engine, post_scan_tasks, openapi_parser, custom_checks/),
`integrations/` (n8n_service, zap_service), `reports/` (pdf_service,
report_export_service, storage_service). Le check BOLA a été extrait dans
`custom_checks/bola.py`.

**Scan piloté par spec OpenAPI/Swagger** (nouveau) : `openapi_parser.py`
parse une spec OpenAPI 3.x ou Swagger 2.0 (JSON/YAML), résout
`servers[0].url`/`host+basePath`, résout les `{path_params}` avec des
valeurs factices, plafonne à 25 endpoints. `scan_engine.py` exécute
désormais les 8 checks OWASP sur **chaque endpoint** de la spec (au lieu
de la seule URL racine). Testé de bout en bout : upload d'une spec → scan
→ chaque endpoint réellement audité individuellement (vérifié via les logs
et le score final).

**ZAP — import de la spec avant le spider** (nouveau) : `zap_service.
import_openapi_spec()` — nécessite un daemon ZAP sur la même machine (lit
le fichier localement). `ZAP_ENABLED=false` par défaut ; non testé contre
un vrai daemon ZAP (aucun disponible dans cet environnement), mais 5 tests
unitaires (respx) couvrent la logique.

**PostgreSQL** : Docker non installé sur la machine, et son installation
demande des étapes manuelles (droits admin, WSL2, redémarrage, écrans
graphiques) impossibles à automatiser seul. Un **service PostgreSQL 18
natif Windows** tournait déjà sur la machine — utilisé à la place du
conteneur Docker prévu dans `docker-compose.yml` : base `evapi`, rôle
`evapi`/`evapi_secret` (mêmes identifiants que le conteneur Docker, pour
rester cohérent si Docker est installé plus tard).
`DATABASE_URL=postgresql+psycopg2://evapi:evapi_secret@localhost:5432/evapi`
dans `.env`. `alembic upgrade head` exécuté (no-op sur base vierge — le
schéma est réellement créé par `create_tables()` au démarrage, comme en
SQLite ; Alembic ne gère ici qu'un delta). Vérifié en conditions réelles :
login, dashboard, scan complet, rapports, vulnérabilités — identique à
SQLite. Pour revenir à SQLite : `DATABASE_URL=sqlite:///./scanapi.db`.

### E. Checks BFLA/Mass Assignment + bug de génération PDF

**BFLA (API5:2023) et Mass Assignment (API3:2023)** (nouveau) :
`custom_checks/bfla_check.py` et `mass_assignment_check.py`. Nécessitent un
token d'un rôle restreint sur l'**API cible** (pas EvAPI) — nouveau champ
`ScanCreate.auth` (`token`, `role_name`), inexistant avant, ajouté pour
porter cette information jusqu'au moteur de scan. Actifs uniquement si
`auth` est fourni ; ignorés sinon. Testés en conditions réelles (logs "BFLA
: 0 finding(s)", "Mass Assignment : 0 finding(s)" sur httpbin.org) + 6 tests
unitaires.

**Bug de génération PDF corrigé** — root cause réelle trouvée par
reproduction isolée (pas la théorie initiale du "texte trop long") :
`multi_cell(w=0, ...)` de fpdf2 laisse le curseur au **bord droit de la
page** en fin d'appel (`new_x=XPos.RIGHT` par défaut). Le code enchaînait
titre → endpoint → description → recommandation **sans jamais remettre le
curseur à gauche entre chaque appel** — le second appel calculait donc une
largeur disponible de **0** et échouait instantanément, quel que soit son
contenu (même un message de repli très court plantait pour cette raison).
Corrigé en réinitialisant `pdf.x` à la marge gauche avant chaque
`multi_cell()`. Vérifié par un vrai téléchargement de PDF (200 OK, fichier
PDF valide, 1 page). 4 tests unitaires.

### F. Corrections mineures

- `storage_service.save_upload_file()` : docstring corrigé ("chemin
  relatif" → "chemin absolu — revalidé par `get_file_path()` avant usage"),
  cohérent avec le comportement réel.
- `ScanResponse` : ajout du champ `pdf_report_path` pour que
  `GET /reports/{scan_id}` expose la disponibilité du PDF sans forcer un
  second appel. *Remarque* : ce champ expose le chemin absolu du serveur
  (utile pour du dev local, à reconsidérer — ex. `pdf_available: bool` —
  si le backend tourne un jour sur une machine partagée).

### G. Nettoyage final

Un cahier de charge affirmait plusieurs incohérences entre l'état réel du
dépôt et cette documentation — vérifiées systématiquement avant d'agir :

| Point annoncé | Réalité vérifiée | Action |
|---|---|---|
| `app/api/routers/ai.py` / `app/services/integrations/ai_service.py` à supprimer | N'existent nulle part — déjà supprimés | ✅ Aucune action |
| `scanapi.db`, `.pytest_cache/` obsolètes | Existaient sur disque (déjà gitignorés) | ✅ Supprimés |
| `alembic/alembic.code-workspace` égaré | Existait et **était suivi par Git** | ✅ Supprimé + `.gitignore` complété |
| 8 `.jsx` + `package.json` + `SAUVEGARDE.md` orphelins à la racine frontend | Existaient toujours | ✅ Supprimés + lien mort retiré du README |
| **`openapi_parser.py`, `app/repositories/`, `n8n-workflows/...json` "manquants"** | **Faux** — existaient déjà et fonctionnent | ❌ Pas recréés (aurait écrasé du code testé) |

**Piège évité** : `git add -A` a failli embarquer le worktree Git oublié
comme dépôt imbriqué — retiré du staging avant le commit.

Vérifications finales : zéro référence résiduelle à `ai_service`/`ollama`,
23/23 tests passent, backend démarre, frontend build sans erreur.

---

## 3. Architecture actuelle (snapshot)

```
scanner-api-backend/          (dépôt evAPI)
└── app/
    ├── routers/               # auth, scans, reports, dashboard, files, integrations
    ├── repositories/          # User, Scan, Vulnerability
    ├── models/, schemas/, core/
    └── services/
        ├── scanner/
        │   ├── scan_engine.py           # orchestrateur (OWASP + ZAP)
        │   ├── openapi_parser.py
        │   ├── post_scan_tasks.py       # PDF + n8n (plus d'IA)
        │   └── custom_checks/
        │       ├── bola.py              # API1:2023
        │       ├── bfla_check.py        # API5:2023
        │       └── mass_assignment_check.py  # API3:2023
        ├── integrations/
        │   ├── n8n_service.py
        │   └── zap_service.py           # + import_openapi_spec()
        └── reports/
            ├── pdf_service.py
            ├── report_export_service.py
            └── storage_service.py

apiScanner/                    (dépôt evAPIFront, racine)
├── scanner-api/                # frontend React
├── docs/                       # dont ce fichier
└── n8n-workflows/
    └── evapi-scan-complete.json
```

---

## 4. État par fonctionnalité

| Fonctionnalité | Statut | Détail |
|--------|--------|--------|
| Authentification JWT | ✅ | Repository pattern |
| Moteur de scan OWASP | ✅ | HTTPS, headers, CORS, auth, rate limit, BOLA, SQLi, SSRF |
| Scan piloté par spec OpenAPI/Swagger | ✅ | Testé de bout en bout |
| BFLA (API5:2023) | ✅ | Nécessite `ScanCreate.auth` ; testé sur httpbin.org (0 finding, cible non vulnérable) |
| Mass Assignment (API3:2023) | ✅ | Idem |
| OWASP ZAP — import spec avant spider | ✅ (code) | Non testé contre un vrai daemon ZAP |
| Rapports (export JSON/CSV, import) | ✅ | Repository pattern |
| Vulnérabilités (filtres, statut) | ✅ | Repository pattern |
| Dashboard | ✅ | Agrégations via repositories |
| PDF automatique en fin de scan | ✅ | Bug corrigé, vérifié par téléchargement réel |
| n8n — workflow IA + Slack | ✅ (code) | Non testé contre une instance n8n réelle |
| PostgreSQL | ✅ | Basculé et vérifié (service natif, pas Docker) |
| Architecture Repository | ✅ | User/Scan/Vulnerability |
| Services réorganisés | ✅ | scanner/ · integrations/ · reports/ |
| Session frontend (refresh de page) | ✅ | Bug `ProtectedRoute` corrigé |

---

## 5. Décisions en attente / prochaines étapes

1. **`.venv/` à la racine** (doublon Python inutilisé, non suivi) — jamais
   sélectionné pour suppression.
2. **Historique Git de `evAPI`** : `venv/`, `.env`, `scanapi.db` retirés du
   suivi actuel mais toujours visibles dans les anciens commits déjà
   poussés — purge non faite (aucun vrai secret exposé, jugé non prioritaire).
3. **Worktree Git oublié** (`scanner-api-backend.worktrees/agents-create-
   cloud-storage-bucket-function`) — sans rapport avec EvAPI, jamais nettoyé.
4. Tester le workflow n8n et l'import OpenAPI dans ZAP contre de vraies
   instances (webhook, Ollama, Slack, daemon ZAP réels).
5. Tester BFLA/Mass Assignment contre une vraie API cible avec de vrais
   rôles/permissions (httpbin.org n'a pas d'endpoints admin réels).
6. Étendre la couche Repository aux services d'écriture (`scan_engine.py`,
   `post_scan_tasks.py`) si séparation complète voulue.
7. `ScanCreate.auth` n'est branché que sur `POST /scans`, pas sur le
   déclenchement n8n (`/integrations/n8n/trigger-scan`).
8. Reconsidérer l'exposition du chemin absolu dans `pdf_report_path`
   (→ `pdf_available: bool` si besoin de ne pas révéler la structure serveur).

Tout le reste (backend + frontend) est commité **et poussé** sur GitHub.

---

## 6. Démarrer le projet

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
- Tests backend : `cd scanner-api-backend && python -m pytest tests/ -v` (23 tests)
