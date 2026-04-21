import { Router } from 'express'
import { clearSessionCookie, currentUser, setSessionCookie, tryLogin } from '../auth.js'

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
