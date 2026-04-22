import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import TransactionForm from '../dashboard/TransactionForm.jsx'
import CardsOverview from '../dashboard/CardsOverview.jsx'
import RecentTransactions from '../dashboard/RecentTransactions.jsx'
import ApprovalQueue from '../dashboard/ApprovalQueue.jsx'
import ApprovalHistory from '../dashboard/ApprovalHistory.jsx'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [txnRefresh, setTxnRefresh] = useState(0)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState(null)

  const isManager = user?.role === 'manager'

  const refreshCards = useCallback(async () => {
    try {
      const c = await api.listCards()
      setCards(c.cards)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const refreshApprovals = useCallback(async () => {
    if (!user?.id || !isManager) return
    try {
      const [p, h] = await Promise.all([
        api.pendingApprovals(user.id),
        api.approvalHistory(user.id),
      ])
      setPending(p.approvals)
      setHistory(h.history)
    } catch {
      // non-managers will get a 403; silently ignore
    }
  }, [user?.id, isManager])

  useEffect(() => {
    refreshCards()
    refreshApprovals()
  }, [refreshCards, refreshApprovals])

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

  function showToast(t) {
    setToast(t)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <>
      {error && (
        <div className="txn-banner txn-banner-bad" role="alert">
          <strong>Error</strong>
          <span>{error}</span>
        </div>
      )}

      <TransactionForm cards={cards} onSubmitted={afterTxn} />
      <CardsOverview cards={cards} />
      <RecentTransactions refreshKey={txnRefresh} />

      {isManager && (
        <>
          <ApprovalQueue
            managerId={user.id}
            managerName={user.name}
            approvals={pending}
            onChange={afterDecision}
            onToast={showToast}
          />
          <ApprovalHistory history={history} />
        </>
      )}

      {toast && <div className={`app-toast app-toast-${toast.kind}`}>{toast.text}</div>}
    </>
  )
}
