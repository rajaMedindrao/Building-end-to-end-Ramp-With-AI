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
