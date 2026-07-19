# EvAPI — PostgreSQL, PDF, IA et n8n

## 1. PostgreSQL (Docker)

```powershell
cd apiScanner
docker compose up -d postgres
```

Dans `scanner-api-backend/.env` :

```env
DATABASE_URL=postgresql+psycopg2://evapi:evapi_secret@localhost:5432/evapi
```

Migrations :

```powershell
cd scanner-api-backend
.\venv\Scripts\pip install psycopg2-binary
.\venv\Scripts\alembic.exe upgrade head
```

Redémarrer le backend.

---

## 2. PDF

- Généré **automatiquement** à la fin de chaque scan (`PDF_ENABLED=true`)
- Téléchargement : `GET /api/v1/files/reports/{scan_id}/pdf`
- Bouton **PDF** sur la page détail du rapport

---

## 3. IA (Ollama)

1. Installer [Ollama](https://ollama.com/) ou décommenter `ollama` dans `docker-compose.yml`
2. `ollama pull llama3`
3. Vérifier : `GET /api/v1/ai/status`

Enrichissement manuel : `POST /api/v1/ai/reports/{scan_id}/enrich` (bouton **IA** dans l’UI)

---

## 4. n8n

### Démarrer n8n

```powershell
docker compose up -d n8n
```

Interface : http://localhost:5678

### Webhook sortant (EvAPI → n8n)

1. Créer un workflow avec nœud **Webhook** (POST)
2. Copier l’URL (ex. `http://localhost:5678/webhook/evapi-scan`)
3. Dans `.env` : `N8N_WEBHOOK_URL=<cette URL>`

Événements reçus :

| event | Quand |
|-------|--------|
| `scan.started` | Scan lancé via n8n |
| `scan.completed` | Scan terminé (+ score, PDF) |
| `scan.error` | Échec |

### Déclencher un scan depuis n8n (n8n → EvAPI)

1. `.env` : `N8N_API_KEY=ma_cle_secrete`
2. Nœud **HTTP Request** :
   - POST `http://host.docker.internal:8000/api/v1/integrations/n8n/trigger-scan`
   - Header : `X-N8N-API-Key: ma_cle_secrete`
   - Body JSON :

```json
{
  "target_url": "https://httpbin.org",
  "scan_type": "standard",
  "selected_checks": []
}
```

> Sous Windows Docker, utilisez `host.docker.internal` pour joindre le backend sur la machine hôte.

### Healthcheck

`GET /api/v1/integrations/n8n/health`
