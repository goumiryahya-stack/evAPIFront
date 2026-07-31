# Cahier de charges — Fiabilisation du moteur DAST EvAPI (ZAP / concurrence / observabilité)

Issu de l'audit du 31/07/2026 (validation ZAP, auth cible, workflow n8n,
sécurité JWT, logging). Les points déjà conformes sont rappelés en
référence ; ce document ne spécifie que les écarts à combler.

---

## Rôle

Développeur Backend Senior, Expert Python/FastAPI et Sécurité Applicative,
sur `scanner-api-backend/` (dépôt `evAPI`).

## Acquis (ne pas retoucher sans raison)

- Intégration ZAP fonctionnelle (`app/services/integrations/zap_service.py`) :
  spider → scan actif → alertes → mapping, async, timeouts en place
- Algorithm pinning JWT correct (`algorithms=[settings.ALGORITHM]`),
  expiration 60 min, bcrypt constant-time
- Workflow complet scan → DB (`scan_id`) → webhook n8n → Ollama (via
  `n8n-workflows/evapi-scan-complete.json`)
- Erreurs ZAP capturées et loguées avec `scan_id`, scan marqué `ERROR`
  proprement
- Aucun credential (`ScanAuthConfig.token`) jamais loggé ni persisté en base

---

## TÂCHE 1 (PRIORITÉ HAUTE) — Guard anti-doublon (409 Conflict)

### Problème
Rien n'empêche un utilisateur de lancer plusieurs scans simultanés sur la
même `target_url`. Risque : charge inutile sur la cible, résultats
incohérents, gaspillage de ressources.

### Spec
Dans `app/repositories/scan_repository.py`, ajouter :
```python
def get_active_by_owner_and_url(self, owner_id: str, target_url: str) -> Scan | None:
    """Scan PENDING ou RUNNING existant pour cette URL et cet utilisateur."""
```

Dans `app/routers/scans.py`, `create_scan()` : avant de créer le nouveau
`Scan`, appeler ce repository. Si un scan actif existe déjà sur la même
`target_url` pour l'utilisateur courant, lever :
```python
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail=f"Un scan est déjà en cours sur {target_url} (id={existing.id})",
)
```

### Critères d'acceptation
- Deux `POST /scans` consécutifs sur la même URL, sans attendre la fin du
  premier → le second reçoit 409, pas un nouveau scan créé
- Un scan `COMPLETED`/`CANCELLED`/`ERROR` sur cette URL n'empêche PAS un
  nouveau scan (seul `PENDING`/`RUNNING` bloque)
- Test : `tests/routers/test_scans.py::test_duplicate_scan_returns_409`

---

## TÂCHE 2 (PRIORITÉ HAUTE) — Health-check ZAP avant de lancer le spider

### Problème
Si ZAP est indisponible, l'échec n'arrive qu'au milieu du pipeline (à
l'appel spider), après avoir déjà avancé la progression du scan.

### Spec
Dans `app/services/integrations/zap_service.py`, ajouter :
```python
async def check_zap_available(client: httpx.AsyncClient) -> bool:
    """GET /JSON/core/view/version/ — True si ZAP répond, False sinon (jamais d'exception)."""
```

Dans `run_full_scan()`, appeler ce check en tout premier ; si `False`,
lever `ZapServiceError("ZAP indisponible sur {ZAP_API_URL}")` immédiatement
— le point d'appel dans `scan_engine.py` (déjà dans un `try/except
ZapServiceError`) n'a pas besoin de changer.

### Critères d'acceptation
- ZAP down → `ZapServiceError` levée avant toute tentative de spider (pas
  de timeout de 20 min à attendre)
- Test respx : mock `/JSON/core/view/version/` en erreur → `run_full_scan`
  lève `ZapServiceError` sans jamais appeler `/JSON/spider/action/scan/`

---

## TÂCHE 3 (PRIORITÉ HAUTE) — Logging structuré JSON

### Problème
Logging actuel en texte libre (`logger.info("Spider ZAP démarré [id=%s]", ...)`)
— pas de `timestamp`/`scan_id`/`action`/`status`/`duration` exploitables
par un outil de log parsing, alors que c'est un point explicitement
attendu pour un outil de sécurité (traçabilité des scans).

### Spec
Ajouter `python-json-logger` à `requirements.txt`. Dans
`app/core/logging_config.py` (nouveau fichier), configurer un handler
JSON appliqué à `logging.getLogger("evapi")` (racine de tous les loggers
du projet, qui sont déjà nommés `evapi.scan_engine`, `evapi.zap_service`,
etc.) :
```python
{
  "timestamp": "...", "logger": "evapi.zap_service", "level": "INFO",
  "message": "...", "scan_id": "...", "action": "...", "duration_ms": ...
}
```
Appeler cette config au démarrage dans `app/main.py` (lifespan, avant le
premier log). Ne pas réécrire chaque appel `logger.info(...)` existant —
utiliser `logging.LoggerAdapter` ou passer `extra={"scan_id": ..., "action": ...}`
uniquement aux points d'appel qui structurent déjà un scan (scan_engine,
zap_service, post_scan_tasks).

### Critères d'acceptation
- `uvicorn app.main:app` → les logs de scan sortent en JSON valide
  (`json.loads()` sur chaque ligne ne lève pas d'exception)
- Chaque log lié à un scan contient au minimum `scan_id`

---

## TÂCHE 4 (PRIORITÉ MOYENNE) — Retry automatique sur échec ZAP

### Problème
`n8n_service.send_scan_complete_webhook()` a 3 tentatives avec backoff
(2s × tentative) ; `zap_service._zap_get()` échoue immédiatement au
premier problème réseau, sans retry, alors que ZAP (souvent local/docker)
peut avoir des latences de démarrage transitoires.

### Spec
Dans `zap_service.py`, réutiliser le même pattern que `n8n_service.py` :
`MAX_RETRIES = 3` dans `_zap_get()`, backoff `2 * attempt` secondes,
logger un warning à chaque tentative échouée, ne lever `ZapServiceError`
qu'après épuisement des tentatives. Ne PAS retry sur les erreurs
applicatives claires (ex: 404, clé API invalide) — seulement sur
`httpx.TransportError`/timeout.

### Critères d'acceptation
- Mock respx : 2 échecs réseau puis 1 succès → `_zap_get` retourne le
  résultat, pas d'exception
- Mock respx : 3 échecs → `ZapServiceError` levée après la 3e tentative
- Test : `tests/services/integrations/test_zap_service.py::test_zap_get_retries_on_network_error`

---

## TÂCHE 5 (PRIORITÉ BASSE — sur demande explicite uniquement)

### 5a. Limite de concurrence des scans

Pas de `asyncio.Semaphore` ni de pool borné aujourd'hui — chaque scan
tourne dans son propre thread via `BackgroundTasks`. Non prioritaire tant
qu'il n'y a pas de charge multi-utilisateurs réelle ; à faire seulement
si un besoin concret apparaît (ex: limiter à N scans simultanés par
utilisateur ou globalement, via un `Semaphore` partagé dans
`scan_engine.py`).

### 5b. Extension de `ScanAuthConfig` (Basic Auth, API Key)

`ScanAuthConfig` ne supporte que `token` (Bearer). Étendre à Basic
Auth/API Key seulement si un scan réel doit tester une cible qui les
utilise — sinon c'est du travail pour un besoin hypothétique. Si demandé :
ajouter un champ `auth_type: Literal["bearer", "basic", "api_key"]` et
adapter `bfla_check.py`/`mass_assignment_check.py` pour construire le
header en conséquence (`Authorization: Basic ...` ou header custom pour
API Key). Toujours pas de persistance en base (le token reste transitoire,
comme aujourd'hui) sauf besoin explicite de scans planifiés/récurrents.

---

## Ordre d'exécution recommandé

1. Tâche 1 (409) — isolé, faible risque, valeur immédiate
2. Tâche 2 (health-check ZAP) — isolé à `zap_service.py`
3. Tâche 3 (logging JSON) — transverse mais mécanique, pas de logique métier touchée
4. Tâche 4 (retry ZAP) — petit diff, copie un pattern déjà validé
5. Tâche 5 — uniquement si le besoin se confirme

Pour chaque tâche : code complet + tests, vérifié en conditions réelles
(pas seulement les tests unitaires) avant de passer à la suivante.
