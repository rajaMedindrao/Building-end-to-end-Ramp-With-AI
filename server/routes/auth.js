import { Router } from 'express'
import { clearSessionCookie, currentUser, setSessionCookie, tryLogin } from '../auth.js'
import { db, hashPassword } from '../db.js'

const router = Router()

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = tryLogin(email, password)
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  setSessionCookie(res, user)
  res.json({ user: publicUser(user) })
})

router.post('/logout', (req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  const user = currentUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ user: publicUser(user) })
})

// Anyone can register themselves. New accounts default to the LEAST
// privileged role ('employee') — privileged actions (card CRUD, approval
// decisions) are gated on role='manager', so self-signup must NOT grant
// that role or anyone could escalate to manager just by registering.
// An existing manager can promote a user later if needed.
router.post('/signup', (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const department = String(req.body?.department || 'Company').trim() || 'Company'

  if (!name) return res.status(400).json({ error: 'Name is required' })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  // Pick a default manager so any over-$500 charges this user incurs on
  // future cards have a real approver to route to.
  const fallbackManager = db
    .prepare("SELECT id FROM employees WHERE role = 'manager' ORDER BY id LIMIT 1")
    .get()

  let info
  try {
    info = db
      .prepare(
        `INSERT INTO employees (name, email, department, role, manager_id, password_hash)
         VALUES (?, ?, ?, 'employee', ?, ?)`,
      )
      .run(name, email, department, fallbackManager?.id || null, hashPassword(password))
  } catch (err) {
    // Race-safe duplicate handling: rely on the UNIQUE(email) constraint
    // instead of a check-then-insert pattern that two concurrent signups
    // could both pass.
    if (String(err.code || '').includes('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }
    throw err
  }

  const user = db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid)
  setSessionCookie(res, user)
  res.status(201).json({ user: publicUser(user) })
})

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    role: u.role,
    manager_id: u.manager_id,
  }
}

export default router
