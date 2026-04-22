import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import RecentTransactions from '../dashboard/RecentTransactions.jsx'

export default function OverviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [pending, setPending] = useState([])
  const [txnRefresh] = useState(0)

  const load = useCallback(async () => {
    try {
      const [cardsRes, managersRes] = await Promise.all([
        api.listCards(),
        api.listManagers(),
      ])
      setCards(cardsRes.cards)
      const myId = managersRes.managers.find((m) => m.id === user?.id)?.id || managersRes.managers[0]?.id
      if (myId) {
        const { approvals } = await api.pendingApprovals(myId)
        setPending(approvals)
      }
    } catch {
      // silently ignore — non-managers won't have approval access
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  return (
    <>
      <section className="dash-card overview-user-card">
        <div className="overview-avatar">{user?.name?.[0] ?? '?'}</div>
        <div className="overview-user-details">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <div className="overview-badges">
            <span className="pill pill-info">{user?.role}</span>
            <span className="pill pill-neutral">{user?.department}</span>
          </div>
        </div>
        <div className="overview-stats">
          <div className="overview-stat">
            <span className="overview-stat-num">{cards.length}</span>
            <span className="overview-stat-label">Cards</span>
          </div>
          <div className="overview-stat">
            <span className="overview-stat-num">{pending.length}</span>
            <span className="overview-stat-label">Pending approvals</span>
          </div>
        </div>
      </section>

      <RecentTransactions refreshKey={txnRefresh} />

      {pending.length > 0 && (
        <section className="dash-card">
          <header className="dash-card-head dash-card-head-row">
            <div>
              <h2>Pending approvals</h2>
              <p>{pending.length} transaction{pending.length !== 1 ? 's' : ''} awaiting your review.</p>
            </div>
            <button
              type="button"
              className="btn btn-lime btn-sm"
              onClick={() => navigate('/app/transactions')}
            >
              Go to Transactions
            </button>
          </header>
          <ul className="overview-pending-list">
            {pending.slice(0, 3).map((a) => (
              <li key={a.approval_id} className="overview-pending-item">
                <span className="overview-pending-merchant">{a.merchant_name}</span>
                <span className="overview-pending-amount">{a.amount_display}</span>
                <span className="pill pill-pending">pending</span>
              </li>
            ))}
            {pending.length > 3 && (
              <li className="overview-pending-more">+{pending.length - 3} more</li>
            )}
          </ul>
        </section>
      )}
    </>
  )
}
