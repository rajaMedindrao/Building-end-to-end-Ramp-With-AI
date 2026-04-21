import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import TransactionForm from '../dashboard/TransactionForm.jsx'
import CardsOverview from '../dashboard/CardsOverview.jsx'
import RecentTransactions from '../dashboard/RecentTransactions.jsx'
import ApprovalQueue from '../dashboard/ApprovalQueue.jsx'
import ApprovalHistory from '../dashboard/ApprovalHistory.jsx'
import CardsManager from '../dashboard/CardsManager.jsx'
import DbInspector from '../dashboard/DbInspector.jsx'

const TABS = [
  { id: 'cards', label: 'Cards' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'database', label: 'Database' },
]

export default function AppDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('cards')
  const [cards, setCards] = useState([])
  const [employees, setEmployees] = useState([])
  const [managers, setManagers] = useState([])
  const [managerId, setManagerId] = useState(null)
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState(null)
  const [error, setError] = useState(null)
  const [txnRefresh, setTxnRefresh] = useState(0)

  const refreshCards = useCallback(async () => {
    try {
      const c = await api.listCards()
      setCards(c.cards)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const refreshEmployees = useCallback(async () => {
    try {
      const r = await api.listEmployees()
      setEmployees(r.employees)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const refreshApprovals = useCallback(
    async (mid) => {
      const id = mid ?? managerId
      if (!id) return
      try {
        const [p, h] = await Promise.all([api.pendingApprovals(id), api.approvalHistory(id)])
        setPending(p.approvals)
        setHistory(h.history)
      } catch (e) {
        setError(e.message)
      }
    },
    [managerId],
  )

  useEffect(() => {
    refreshCards()
    refreshEmployees()
    api
      .listManagers()
      .then((r) => {
        setManagers(r.managers)
        const initial = r.managers.find((m) => m.id === user?.id)?.id || r.managers[0]?.id
        if (initial) setManagerId(initial)
      })
      .catch((e) => setError(e.message))
  }, [refreshCards, refreshEmployees, user?.id])

  useEffect(() => {
    if (managerId) refreshApprovals(managerId)
  }, [managerId, refreshApprovals])

  function showToast(t) {
    setToast(t)
    setTimeout(() => setToast(null), 2200)
  }

  async function afterTxn() {
    await refreshCards()
    await refreshApprovals()
    setTxnRefresh((n) => n + 1)
  }

  async function afterDecision() {
    await refreshApprovals()
    await refreshCards()
    setTxnRefresh((n) => n + 1)
  }

  const activeManager = managers.find((m) => m.id === managerId)

  return (
    <main className="app-shell">
      <header className="app-bar">
        <div className="app-bar-left">
          <Link to="/" className="app-brand">
            ramp by Surge AI
          </Link>
          <nav className="app-tabs" aria-label="Sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`app-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="app-bar-right">
          <span className="muted">
            {user?.name} · {user?.role} · {user?.department}
          </span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="txn-banner txn-banner-bad" role="alert">
          <strong>✗ Error</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="app-grid">
        {tab === 'cards' && (
          <CardsManager cards={cards} employees={employees} onChange={refreshCards} />
        )}

        {tab === 'transactions' && (
          <>
            <TransactionForm cards={cards} onSubmitted={afterTxn} />
            <CardsOverview cards={cards} />
            <RecentTransactions refreshKey={txnRefresh} />
          </>
        )}

        {tab === 'approvals' && (
          <>
            <section className="dash-card">
              <header className="dash-card-head dash-card-head-row">
                <div>
                  <h2>View as manager</h2>
                  <p>Switch perspective to review another manager's queue.</p>
                </div>
                <select
                  value={managerId || ''}
                  onChange={(e) => setManagerId(Number(e.target.value))}
                >
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.department}
                    </option>
                  ))}
                </select>
              </header>
            </section>
            <ApprovalQueue
              managerId={managerId}
              managerName={activeManager?.name}
              approvals={pending}
              onChange={afterDecision}
              onToast={showToast}
            />
            <ApprovalHistory history={history} />
          </>
        )}

        {tab === 'database' && <DbInspector />}
      </div>

      {toast && <div className={`app-toast app-toast-${toast.kind}`}>{toast.text}</div>}
    </main>
  )
}
