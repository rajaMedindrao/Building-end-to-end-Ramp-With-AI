import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const DB_PATH = process.env.DB_PATH || resolve(process.cwd(), 'data', 'app.db')
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      manager_id INTEGER REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      approver_id INTEGER REFERENCES employees(id),
      card_name TEXT NOT NULL,
      card_type TEXT NOT NULL DEFAULT 'physical',
      spend_limit_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      blocked_categories TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      manager_id INTEGER NOT NULL REFERENCES employees(id),
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      decided_at TIMESTAMP,
      manager_note TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL REFERENCES cards(id),
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      merchant_name TEXT NOT NULL,
      merchant_category TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      decline_reason TEXT,
      approval_id INTEGER REFERENCES approvals(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_spend (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL REFERENCES cards(id),
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      total_spent_cents INTEGER NOT NULL DEFAULT 0,
      UNIQUE(card_id, month, year)
    );
  `)
}

export function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS c FROM employees').get()
  if (row.c > 0) return

  const insertEmp = db.prepare(
    'INSERT INTO employees (name, email, department, role, manager_id) VALUES (?, ?, ?, ?, ?)',
  )
  const insertCard = db.prepare(
    `INSERT INTO cards
     (employee_id, approver_id, card_name, card_type, spend_limit_cents, status, blocked_categories)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )

  db.transaction(() => {
    // Three users only. Raja is the top-level manager and approves
    // every card in the seed (including his own — he's his own approver
    // so his over-$500 charges still flow through the same queue).
    const raja = insertEmp.run('Raja Surge', 'raja@surgeai.com', 'Operations', 'manager', null)
      .lastInsertRowid
    const nick = insertEmp.run('Nick Patel', 'nick@surgeai.com', 'Product', 'employee', raja)
      .lastInsertRowid
    const sully = insertEmp.run('Sully Reyes', 'sully@surgeai.com', 'Chief of Staff', 'employee', raja)
      .lastInsertRowid

    insertCard.run(raja, raja, 'Raja Ops Card', 'physical', 1000000, 'active', '[]')
    insertCard.run(nick, raja, 'Nick Prod Card', 'physical', 500000, 'active', '[]')
    insertCard.run(sully, raja, 'Sully CoS Card', 'physical', 500000, 'active', '[]')
  })()
}

initSchema()
seedIfEmpty()

// One-line schema summary at boot so the user can see in the workflow
// log that the SQLite tables actually exist (they don't show up in
// Replit's database pane because that's Postgres-only).
export function logSchemaSummary() {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((t) => t.name)
  const counts = tables.map((name) => {
    const c = db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get().n
    return `${name}=${c}`
  })
  console.log(`[db] ${DB_PATH}`)
  console.log(`[db] tables: ${counts.join(', ')}`)
}

logSchemaSummary()
