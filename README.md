# Ramp — Corporate Card & Expense Management

A full-stack clone of [Ramp](https://ramp.com) built end-to-end with AI. Covers the core spend control loop: issue cards, submit transactions, route to the right approver, and approve or reject in real time.

**Live demo:** _[Add your Replit URL here once deployed]_

---

## What it does

| Area | Details |
|---|---|
| **Cards** | Issue physical/virtual cards, set monthly limits, block categories, assign an approver |
| **Transactions** | Submit charges against a card — routed to the approver automatically |
| **Approvals** | Approvers see pending transactions in their queue; approve or reject with an optional note |
| **Overview** | Signed-in dashboard showing spend stats, recent transactions, and pending approvals at a glance |
| **Auth** | Cookie-based sessions; multiple demo accounts with role-based access |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 6, React Router 7 |
| Backend | Node 20, Express 5 |
| Database | SQLite via better-sqlite3 |
| Auth | HMAC-signed session cookies (no JWT library) |
| Hosting | Replit (dev) / Docker + Cloud Run (prod) |

---

## Run locally

```bash
git clone https://github.com/rajaMedindrao/Building-end-to-end-Ramp-With-AI.git
cd Building-end-to-end-Ramp-With-AI
npm install
npm run dev
```

Open `http://localhost:5000`

---

## Run on Replit

1. Import this repo on [Replit](https://replit.com) → **Import from GitHub**
2. Hit **Run** — Replit installs dependencies and starts the dev server automatically
3. The app opens in the webview on port 5000

---

## Demo accounts

All accounts use password **`surgeai`**

| Name | Email | Role |
|---|---|---|
| Raja Surge | raja@surgehq.ai | Manager |
| Sullivan Surge | sullivanwhitely@surgehq.ai | Manager |
| Nick Surge | nickheiner@surgehq.ai | Manager |
| Surge | surge@surgehq.ai | Manager |

The database seeds itself on first run. No setup required.

---

## How the approval flow works

1. A card is issued with an assigned **approver**
2. Any transaction submitted on that card goes to the approver as **pending**
3. The approver logs in, sees it in their queue, and approves or rejects it
4. The transaction status updates in real time for all users

---

## Project structure

```
server/
  routes/       # auth, cards, transactions, approvals
  services/     # rules engine, spend tracker, approval logic
  db.js         # schema + seed data
src/
  pages/        # Overview, Cards, Transactions (post-login)
  dashboard/    # Reusable UI components
  auth/         # Auth context + protected routes
```
