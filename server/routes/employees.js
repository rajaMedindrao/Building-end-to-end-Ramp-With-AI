import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()

router.get('/', requireAuth, (_req, res) => {
  const rows = db
    .prepare('SELECT id, name, email, department, role, manager_id FROM employees ORDER BY name')
    .all()
  res.json({ employees: rows })
})

export default router
