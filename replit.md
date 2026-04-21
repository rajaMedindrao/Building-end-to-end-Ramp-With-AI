# Building End-to-End Ramp With AI

## Overview
A React + Vite web application imported from GitHub (`rajaMedindrao/Building-end-to-end-Ramp-With-AI`). The repository was empty on import, so a base project structure was created.

## Tech Stack
- **Frontend**: React 18 + Vite 6
- **Package Manager**: npm
- **Runtime**: Node.js 20

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
