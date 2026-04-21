# Building End-to-End Ramp With AI

## Overview
A React + Vite web application imported from GitHub (`rajaMedindrao/Building-end-to-end-Ramp-With-AI`). The repository was empty on import, so a base project structure was created.

## Tech Stack
- **Frontend**: React 18 + Vite 6 (marketing site + signed-in app dashboard)
- **Backend**: Node 20 + Express 5 + better-sqlite3 (single deployable artifact for GCP)
- **Database**: SQLite at `data/app.db` (override with `DB_PATH`)
- **Package Manager**: npm
- **Runtime**: Node.js 20

## App areas
- `/` and other marketing routes — original Ramp clone, no auth required.
- `/signin` — single hardcoded login: `raja@surgeai.com` / `surgeai`.
- `/app` — protected dashboard with the Card Spend Limit rules engine and
  the manager Approval queue (spec in
  `attached_assets/Pasted-The-two-features-I-d-pick-...txt`).

## Backend layout
```
server/
  index.js           # Express app, mounts /api/*; in prod also serves dist/
  db.js              # SQLite connection, schema, seed (idempotent)
  auth.js            # HMAC-signed session cookie + requireAuth middleware
  routes/
    auth.js          # /api/auth/login, /logout, /me
    cards.js         # /api/cards, /api/cards/:id/spend-summary
    transactions.js  # /api/transactions, /api/transactions/submit
    approvals.js     # /api/approvals/{pending,history,managers,:id/decide}
  services/
    rulesEngine.js   # evaluate_transaction (5 rules in strict order) + submit
    spendTracker.js  # monthly_spend read/update
    approvalService.js # process_decision (approve/reject)
```

## Dev / prod wiring
- Dev: `npm run dev` runs Vite (:5000) and Express (:3001) concurrently;
  Vite proxies `/api` to Express. Single workflow.
- Prod: `npm run build` then `npm start` runs Express on `$PORT` (default
  3001), serves the built `dist/` and `/api/*` from one process. Suitable
  for one Cloud Run service.

## Required production env vars
- `SESSION_SECRET` — strong random string. The server fails to start if
  this is unset when `NODE_ENV=production`.
- `SITE_URL` — see section below.
- `DB_PATH` (optional) — point at a persistent volume on Cloud Run.

## Project Structure
```
/
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration (host: 0.0.0.0, port: 5000)
├── package.json
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Root component
│   ├── App.css         # App styles
│   └── index.css       # Global styles
└── public/             # Static assets
```

## Running the App
The app runs via the "Start application" workflow on port 5000.

```bash
npm run dev
```

## Development Notes
- The Vite dev server is configured with `allowedHosts: true` and `host: 0.0.0.0` for Replit's proxy environment.
- Frontend port: 5000 (webview)

## Production domain (`SITE_URL`)
A single env var, `SITE_URL`, controls the absolute domain used for SEO and
social-share URLs. Two places consume it:
- `vite.config.js` — the `absoluteSocialImages` plugin rewrites the
  `og:image` / `twitter:image` paths in `index.html` to absolute URLs at
  build time.
- `scripts/generate-sitemap.mjs` — writes `public/sitemap.xml` and
  `public/robots.txt` using the same domain.

When deploying, set `SITE_URL` to the real production origin (e.g.
`https://your-domain.com`, no trailing slash). If unset it defaults to the
placeholder `https://ramp.example`, which is fine for local dev but should
be overridden before going live.
