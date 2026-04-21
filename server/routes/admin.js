import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

// Lightweight DB inspection so the user can confirm the SQLite tables
// exist and see their row counts directly from the browser. This is NOT
// a SQL console — it only enumerates table names and counts.
router.get('/tables', requireAuth, (_req, res) => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
  const rows = tables.map((t) => {
    const columns = db.prepare(`PRAGMA table_info("${t.name}")`).all().map((c) => ({
      name: c.name,
      type: c.type,
      notnull: !!c.notnull,
      pk: !!c.pk,
    }))
    const count = db.prepare(`SELECT COUNT(*) AS c FROM "${t.name}"`).get().c
    return { name: t.name, row_count: count, columns }
  })
  res.json({ db_path: process.env.DB_PATH || 'data/app.db', tables: rows })
})

export default router
