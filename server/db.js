import Database from 'better-sqlite3'
import crypto from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const DB_PATH = process.env.DB_PATH || resolve(process.cwd(), 'data', 'app.db')
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// scrypt-based password hashing. Stored as `${saltHex}:${hashHex}` so we
// don't need a separate column for the salt and don't need to add a new
// npm dep just for password hashing.
export function hashPassword(plain) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(String(plain), salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}
export function verifyPassword(plain, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false
  const [saltHex, hashHex] = stored.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const got = crypto.scryptSync(String(plain), salt, expected.length)
  return expected.length === got.length && crypto.timingSafeEqual(expected, got)
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      manager_id INTEGER REFERENCES employees(id),
      password_hash TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    `INSERT INTO employees (name, email, department, role, manager_id, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
  const insertCard = db.prepare(
    `INSERT INTO cards
     (employee_id, approver_id, card_name, card_type, spend_limit_cents, status, blocked_categories)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )

  // Single shared password for the demo accounts. Hashed once and reused
  // so the seed transaction stays cheap.
  const sharedHash = hashPassword('surgeai')

  db.transaction(() => {
    // Four seed users — all managers so each can both submit transactions
    // and approve queued ones in the demo.
    const raja = insertEmp.run(
      'Raja Surge', 'raja@surgehq.ai', 'Operations', 'manager', null, sharedHash,
    ).lastInsertRowid
    const sully = insertEmp.run(
      'Sullivan Surge', 'sullivanwhitely@surgehq.ai', 'Chief of Staff', 'manager', raja, sharedHash,
    ).lastInsertRowid
    const nick = insertEmp.run(
      'Nick Surge', 'nickheiner@surgehq.ai', 'Product', 'manager', raja, sharedHash,
    ).lastInsertRowid
    insertEmp.run(
      'Surge', 'surge@surgehq.ai', 'Company', 'manager', raja, sharedHash,
    )

    insertCard.run(raja, raja, 'Raja Ops Card', 'physical', 1000000, 'active', '[]')
    insertCard.run(nick, raja, 'Nick Prod Card', 'physical', 500000, 'active', '[]')
    insertCard.run(sully, raja, 'Sully CoS Card', 'physical', 500000, 'active', '[]')
  })()
}

initSchema()
seedIfEmpty()

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
