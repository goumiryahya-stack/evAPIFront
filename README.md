# EvAPI — Auditeur de sécurité API (OWASP)

Plateforme full-stack pour scanner des APIs REST selon l'**OWASP API Security Top 10**.

## Architecture

```
apiScanner/
├── scanner-api/          # Frontend React (Vite) — port 5173
└── scanner-api-backend/  # Backend FastAPI — port 8000
```

| Couche | Stack |
|--------|--------|
| Frontend | React 19, React Router 7, CSS Modules |
| Backend | FastAPI, SQLAlchemy, SQLite, JWT, httpx |
| Scan | BackgroundTasks, checks OWASP async |

## Démarrage rapide

### Backend

```bash
cd scanner-api-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy EVAPI.txt .env
uvicorn app.main:app --reload --port 8000
```

Documentation : http://127.0.0.1:8000/docs

### Frontend

```bash
cd scanner-api
npm install
npm run dev
```

Application : http://localhost:5173

## Compte démo

| Email | Mot de passe |
|-------|----------------|
| `demo@evapi.com` | `Demo1234` |

Créer / réinitialiser : `python scripts/seed_demo_user.py`

## Fonctionnalités

- Authentification JWT (inscription / connexion)
- Scan asynchrone avec polling temps réel
- Moteur OWASP : HTTPS, headers, CORS, auth, rate limit, BOLA, SQLi, SSRF
- Rapports détaillés et gestion des vulnérabilités
- Tableau de bord avec statistiques live
- Import OpenAPI/Swagger (JSON, YAML)

## Variables d'environnement

Voir `scanner-api-backend/EVAPI.txt` — copier vers `.env` et modifier `SECRET_KEY` en production.

## Documentation complète

- [Guide A → Z](docs/GUIDE_COMPLET.md) — architecture, API, OWASP, import/export
- [PostgreSQL, PDF, IA, n8n](docs/N8N_POSTGRESQL.md) — Docker, Ollama, webhooks
- [Sauvegarde](SAUVEGARDE.md) — Git, OneDrive, ZIP
