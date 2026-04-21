import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { api } from '../api/client.js'

export default function SignUp() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await api.signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim() || 'Company',
        password: form.password,
      })
      // The signup endpoint returns a session cookie, so this just
      // syncs the auth context with the now-active session.
      await refresh()
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account')
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
        <h1>Create account</h1>
        <p className="auth-sub">
          You'll get instant access to the dashboard. New accounts start with
          the employee role and can submit transactions; a manager can promote
          you later to approve queued charges.
        </p>
        <form onSubmit={onSubmit} className="auth-form" noValidate>
          <label>
            <span>Full name</span>
            <input required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
          </label>
          <label>
            <span>Work email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="jane@company.com"
            />
          </label>
          <label>
            <span>Department</span>
            <input
              value={form.department}
              onChange={update('department')}
              placeholder="Engineering"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={update('password')}
              placeholder="At least 6 characters"
            />
          </label>
          <label>
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.confirm}
              onChange={update('confirm')}
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-lime" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
