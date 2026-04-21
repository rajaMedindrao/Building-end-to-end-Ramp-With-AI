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
    'INSERT INTO cards (employee_id, card_name, card_type, spend_limit_cents, status, blocked_categories) VALUES (?, ?, ?, ?, ?, ?)',
  )

  db.transaction(() => {
    // Spec seed
    const sarah = insertEmp.run('Sarah Chen', 'sarah@company.com', 'Engineering', 'manager', null)
      .lastInsertRowid
    const james = insertEmp.run('James Park', 'james@company.com', 'Engineering', 'employee', sarah)
      .lastInsertRowid
    const maria = insertEmp.run('Maria Lopez', 'maria@company.com', 'Sales', 'manager', null)
      .lastInsertRowid
    const tom = insertEmp.run('Tom Wright', 'tom@company.com', 'Sales', 'employee', maria)
      .lastInsertRowid

    insertCard.run(james, 'James Engineering Card', 'physical', 100000, 'active', '[]')
    insertCard.run(tom, 'Tom Sales Card', 'physical', 500000, 'active', '["gambling"]')
    insertCard.run(james, 'James Virtual Card', 'virtual', 20000, 'active', '[]')

    // Logged-in user: raja is a manager in Operations with one direct report.
    // Gives the post-login dashboard meaningful data on first run.
    const raja = insertEmp.run(
      'Raja Surge',
      'raja@surgeai.com',
      'Operations',
      'manager',
      null,
    ).lastInsertRowid
    const priya = insertEmp.run(
      'Priya Nair',
      'priya@surgeai.com',
      'Operations',
      'employee',
      raja,
    ).lastInsertRowid
    insertCard.run(raja, 'Raja Ops Card', 'physical', 750000, 'active', '[]')
    insertCard.run(priya, 'Priya Ops Card', 'physical', 200000, 'active', '["gambling"]')
    insertCard.run(priya, 'Priya Virtual Card', 'virtual', 20000, 'active', '[]')
  })()
}

initSchema()
seedIfEmpty()
