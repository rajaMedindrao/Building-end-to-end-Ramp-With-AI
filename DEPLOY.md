# Run locally and deploy to GCP

This is a single Node/Express artifact. In production, Express serves the
built React SPA from `dist/` **and** the JSON API at `/api/*` on the same
port. SQLite lives in `data/app.db`.

---

## 1. Run on your local machine

### Prereqs
- **Node.js 20** (use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`)
- **Python 3 + a C/C++ toolchain** — only required to compile
  `better-sqlite3` on first install:
  - macOS: `xcode-select --install`
  - Debian/Ubuntu: `sudo apt-get install -y python3 make g++`
  - Windows: install the "Desktop development with C++" workload from
    Visual Studio Build Tools

### Get the code (with Claude Code)
```bash
gh repo clone <your-fork>/Building-end-to-end-Ramp-With-AI
cd Building-end-to-end-Ramp-With-AI
claude   # start Claude Code in this directory if you want AI-assisted edits
```

### Install and run in dev mode
```bash
npm install
npm run dev
```
- Frontend (Vite) → http://localhost:5000
- Backend (Express) → http://localhost:3001 (Vite proxies `/api` to it)

The first boot creates `data/app.db` and seeds the four demo users
(password `surgeai` for all):

| Name            | Email                          |
|-----------------|--------------------------------|
| Raja Surge      | raja@surgehq.ai                |
| Sullivan Surge  | sullivanwhitely@surgehq.ai     |
| Nick Surge      | nickheiner@surgehq.ai          |
| Surge           | surge@surgehq.ai               |

### Build & run the production bundle locally (mirrors Cloud Run)
```bash
npm run build
SESSION_SECRET=$(openssl rand -hex 32) PORT=8080 npm start
# open http://localhost:8080
```

---

## 2. Deploy to GCP Cloud Run

Cloud Run is the right fit: one container, scales to zero, HTTPS for
free, and a generous free tier.

### One-time setup
```bash
# Pick your project and region
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export SERVICE=ramp-with-ai

gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### A. Source-based deploy (simplest — uses the included `Dockerfile`)
```bash
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,SITE_URL=https://YOUR-DOMAIN" \
  --set-secrets   "SESSION_SECRET=ramp-session-secret:latest"
```
Cloud Build builds the image from your `Dockerfile`, pushes it to
Artifact Registry, and rolls it out. The command prints a service URL
when it finishes.

> **Create the secret first** (one-time):
> ```bash
> printf "%s" "$(openssl rand -hex 32)" | \
>   gcloud secrets create ramp-session-secret --data-file=-
> # Allow Cloud Run's runtime SA to read it:
> gcloud secrets add-iam-policy-binding ramp-session-secret \
>   --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')[email protected]" \
>   --role="roles/secretmanager.secretAccessor"
> ```

### B. Build the image yourself, then deploy
```bash
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/apps/$SERVICE
gcloud run deploy $SERVICE \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/apps/$SERVICE \
  --region $REGION --allow-unauthenticated --port 8080 \
  --set-env-vars "NODE_ENV=production,SITE_URL=https://YOUR-DOMAIN" \
  --set-secrets   "SESSION_SECRET=ramp-session-secret:latest"
```

### Required env vars in Cloud Run
| Variable          | Why                                                                                |
|-------------------|------------------------------------------------------------------------------------|
| `NODE_ENV`        | `production` — turns on signed cookies + fail-fast secret check                    |
| `SESSION_SECRET`  | Strong random string. The server **refuses to start** without this in production.  |
| `SITE_URL`        | Public URL used for SEO/OG tags (e.g. `https://yourdomain.com`)                    |
| `PORT`            | Set automatically by Cloud Run (8080). Do not override.                            |
| `DB_PATH`         | Optional — see persistence note below.                                             |

### Important: SQLite + Cloud Run persistence
Cloud Run's container filesystem is **ephemeral**. The default
`data/app.db` lives inside the container, so when an instance shuts
down (scale to zero, redeploy, etc.) you lose all data — users, cards,
transactions, approvals.

For a real deployment you have two options:

1. **Mount a Cloud Run volume backed by Cloud Storage / a Filestore
   share** and point `DB_PATH` at it:
   ```bash
   gcloud run services update $SERVICE --region $REGION \
     --add-volume name=db,type=cloud-storage,bucket=YOUR-BUCKET \
     --add-volume-mount volume=db,mount-path=/data \
     --set-env-vars DB_PATH=/data/app.db
   ```
   Set **min-instances=1** so the container is never reaped:
   ```bash
   gcloud run services update $SERVICE --region $REGION --min-instances=1
   ```

2. **Move the DB to Cloud SQL (Postgres)** for true durability. This
   means swapping `better-sqlite3` for `pg`/Drizzle/etc. Bigger change
   but the right call for any non-demo deployment.

### Custom domain
```bash
gcloud run domain-mappings create --service $SERVICE --domain yourdomain.com --region $REGION
```
Add the DNS records it prints, then re-deploy with
`SITE_URL=https://yourdomain.com` so OG/SEO tags use the real URL.

### Tail logs
```bash
gcloud run services logs tail $SERVICE --region $REGION
```

---

## 3. Quick smoke test after deploy
```bash
URL=$(gcloud run services describe $SERVICE --region $REGION --format='value(status.url)')

curl -s $URL/api/health
# {"ok":true}

curl -s -X POST $URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"raja@surgehq.ai","password":"surgeai"}'
# {"user":{...}}
```
Open the service URL in a browser and sign in.
