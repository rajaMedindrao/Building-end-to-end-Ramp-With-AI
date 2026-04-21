export default function RecentTransactions({ transactions }) {
  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>Recent transactions</h2>
        <p>Latest 50 charges across every card.</p>
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
            {transactions.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No transactions yet — submit one above.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
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
  // sqlite CURRENT_TIMESTAMP comes back as 'YYYY-MM-DD HH:MM:SS' (UTC)
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
