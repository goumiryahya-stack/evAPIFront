# Sauvegarde du projet EvAPI

## Sauvegarde automatique (déjà active)

Le projet est dans **OneDrive** :

`C:\Users\YAHIA\OneDrive\Bureau\apiScanner`

Si OneDrive est connecté, vos fichiers sont copiés dans le cloud.

## Sauvegarde Git (recommandée)

1. Installez Git : https://git-scm.com/download/win
2. Ouvrez PowerShell dans ce dossier et exécutez :

```powershell
cd "C:\Users\YAHIA\OneDrive\Bureau\apiScanner"
git init
git add .
git commit -m "EvAPI: audit sécurité API OWASP - version complète"
```

Pour pousser sur GitHub plus tard :

```powershell
git remote add origin https://github.com/VOTRE_COMPTE/evapi.git
git branch -M main
git push -u origin main
```

## Copie manuelle (ZIP)

Clic droit sur le dossier `apiScanner` → **Envoyer vers** → **Dossier compressé**.

Excluez si possible : `node_modules`, `venv`, `.venv` (réinstallables avec `npm install` / `pip install`).

## Documentation

Guide détaillé A → Z : [docs/GUIDE_COMPLET.md](docs/GUIDE_COMPLET.md)
