import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onOutsideClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/signin', { replace: true })
  }

  const navClass = ({ isActive }) => `app-tab${isActive ? ' is-active' : ''}`

  return (
    <main className="app-shell">
      <header className="app-bar">
        {/* Row 1: brand + profile — always side by side on every screen size */}
        <div className="app-bar-top">
          <Link to="/" className="app-brand">ramp by Surge AI</Link>

          <div className="app-bar-right" ref={dropRef}>
            <button
              type="button"
              className="app-profile-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span className="app-profile-avatar">{user?.name?.[0] ?? '?'}</span>
              <span className="app-profile-name">{user?.name}</span>
              <span className="app-profile-caret" aria-hidden="true">{open ? '▴' : '▾'}</span>
            </button>

            {open && (
              <div className="app-profile-dropdown">
                <div className="app-profile-dropdown-info">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                  <span className="app-profile-dropdown-meta">{user?.role} · {user?.department}</span>
                </div>
                <hr className="app-profile-divider" />
                <button type="button" className="app-profile-signout" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: nav tabs — scrollable on small screens */}
        <nav className="app-tabs" aria-label="Sections">
          <NavLink to="/app/overview" className={navClass}>Overview</NavLink>
          <NavLink to="/app/cards" className={navClass}>Cards</NavLink>
          <NavLink to="/app/transactions" className={navClass}>Transactions</NavLink>
        </nav>
      </header>

      <div className="app-grid">
        <Outlet />
      </div>
    </main>
  )
}
