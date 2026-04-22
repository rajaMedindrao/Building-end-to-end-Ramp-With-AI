import crypto from 'node:crypto'
import { db, verifyPassword } from './db.js'

const isProd = process.env.NODE_ENV === 'production'
const SECRET = process.env.SESSION_SECRET || 'ramp-surge-ai-default-secret'
const COOKIE = 'ramp_session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}
function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Look the user up in the employees table (which doubles as our login
// table) and verify their scrypt-hashed password. Anyone in the table
// with a password_hash can sign in — login is therefore controlled by
// the data, not by a hardcoded constant.
export function tryLogin(email, password) {
  const e = String(email || '').trim().toLowerCase()
  if (!e || !password) return null
  const user = db.prepare('SELECT * FROM employees WHERE LOWER(email) = ?').get(e)
  if (!user || !user.password_hash) return null
  return verifyPassword(password, user.password_hash) ? user : null
}

export function setSessionCookie(res, user) {
  const token = sign({ uid: user.id, email: user.email, exp: Date.now() + MAX_AGE_MS })
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: MAX_AGE_MS,
    path: '/',
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { path: '/' })
}

export function currentUser(req) {
  const token = req.cookies?.[COOKIE]
  const payload = verify(token)
  if (!payload) return null
  return db.prepare('SELECT * FROM employees WHERE id = ?').get(payload.uid) || null
}

export function requireAuth(req, res, next) {
  const user = currentUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  req.user = user
  next()
}
