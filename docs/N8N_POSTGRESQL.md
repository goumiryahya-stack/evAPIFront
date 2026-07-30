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

Le backend EvAPI n'appelle **jamais** Ollama directement — l'IA intervient
uniquement côté n8n, via le workflow décrit section 4 (webhook → Ollama →
Slack/Jira), déclenché automatiquement à la fin de chaque scan
(`scan.completed`).

1. Installer [Ollama](https://ollama.com/) ou décommenter `ollama` dans `docker-compose.yml`
2. `ollama pull llama3`
3. Importer `n8n-workflows/evapi-scan-complete.json` dans n8n (voir section 4)

---

## 4. n8n

### Démarrer n8n

```powershell
docker compose up -d n8n
```

Interface : http://localhost:5678

### Webhook sortant (EvAPI → n8n) — workflow IA + Slack prêt à l'emploi

Un workflow complet est fourni : `n8n-workflows/evapi-scan-complete.json`
(Webhook → Ollama → Extraction réponse → Slack).

1. Ouvrir n8n (http://localhost:5678) → **Import from File** → sélectionner
   `n8n-workflows/evapi-scan-complete.json`
2. Dans le nœud **Envoyer sur Slack**, remplacer l'URL par votre propre
   [webhook entrant Slack](https://api.slack.com/messaging/webhooks)
3. Activer le workflow (toggle en haut à droite)
4. Copier l'URL du nœud **Webhook - Scan Complete** (généralement
   `http://localhost:5678/webhook/evapi-scan-complete`)
5. Dans `scanner-api-backend/.env` : `N8N_WEBHOOK_URL=<cette URL>`

Le nœud Ollama attend `http://ollama:11434` — si Ollama tourne hors Docker,
remplacer par `http://host.docker.internal:11434` (Windows/Mac) dans le
nœud **Ollama - Reformuler le rapport**.

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
