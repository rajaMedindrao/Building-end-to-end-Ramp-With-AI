import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const PAGE_SIZE = 5

export default function RecentTransactions({ refreshKey }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ transactions: [], total: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .listTransactions({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then((r) => {
        if (!cancelled) setData(r)
      })
      .catch(() => {
        if (!cancelled) setData({ transactions: [], total: 0 })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, refreshKey])

  // If a new transaction is submitted, snap back to page 0 so the user
  // sees their newest charge at the top.
  useEffect(() => {
    setPage(0)
  }, [refreshKey])

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const showing =
    data.total === 0
      ? '0 of 0'
      : `${page * PAGE_SIZE + 1}–${Math.min(data.total, (page + 1) * PAGE_SIZE)} of ${data.total}`

  return (
    <section className="dash-card">
      <header className="dash-card-head dash-card-head-row">
        <div>
          <h2>Recent transactions</h2>
          <p>Live feed from the database, paginated 5 at a time.</p>
        </div>
        <div className="pager">
          <button
            type="button"
            className="btn-link"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            ← Prev 5
          </button>
          <span className="muted">{showing}</span>
          <button
            type="button"
            className="btn-link"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
          >
            Next 5 →
          </button>
        </div>
      </header>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Card</th>
              <th>Merchant</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  {loading ? 'Loading…' : 'No transactions yet — submit one above.'}
                </td>
              </tr>
            )}
            {data.transactions.map((t) => (
              <tr key={t.id}>
                <td>{formatDate(t.created_at)}</td>
                <td>{t.card_name}</td>
                <td>{t.merchant_name}</td>
                <td className="cap">{t.merchant_category}</td>
                <td>{t.amount_display}</td>
                <td>
                  <span className={`pill pill-${t.status}`}>{t.status.replace('_', ' ')}</span>
                </td>
                <td className="muted">{t.decline_reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}
