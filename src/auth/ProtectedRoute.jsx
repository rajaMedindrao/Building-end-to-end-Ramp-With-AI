import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return <div className="auth-loading">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }
  return children
}
