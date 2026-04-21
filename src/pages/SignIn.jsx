import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const DEMO_ACCOUNTS = [
  { name: 'Raja Surge', email: 'raja@surgehq.ai' },
  { name: 'Sullivan Surge', email: 'sullivanwhitely@surgehq.ai' },
  { name: 'Nick Surge', email: 'nickheiner@surgehq.ai' },
  { name: 'Surge', email: 'surge@surgehq.ai' },
]

export default function SignIn() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('raja@surgehq.ai')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const redirectTo = location.state?.from || '/app'

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true })
  }, [user, navigate, redirectTo])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          ramp by Surge AI
        </Link>
        <h1>Sign in</h1>
        <p className="auth-sub">
          Pick any of the four demo accounts below. The password is{' '}
          <code>surgeai</code> for all of them.
        </p>

        <ul className="auth-accounts">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                className="auth-account"
                onClick={() => {
                  setEmail(a.email)
                  setPassword('surgeai')
                }}
              >
                <strong>{a.name}</strong>
                <code>{a.email}</code>
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <label>
            <span>Work email</span>
            <input
              type="email"
              autoComplete="username"
              required
              placeholder="raja@surgehq.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              placeholder="surgeai"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-lime" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-foot">
          New here? <Link to="/signup">Create an account</Link>
          <span className="dot">·</span>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </main>
  )
}
