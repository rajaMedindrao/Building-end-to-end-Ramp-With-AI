export default function ApprovalHistory({ history }) {
  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>Approval history</h2>
        <p>Last 20 decisions by this manager.</p>
      </header>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Decided</th>
              <th>Employee</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Decision</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No decisions yet.
                </td>
              </tr>
            )}
            {history.map((h) => (
              <tr key={h.approval_id}>
                <td>{formatDate(h.decided_at)}</td>
                <td>{h.employee_name}</td>
                <td>{h.merchant_name}</td>
                <td>{h.amount_display}</td>
                <td>
                  <span className={`pill pill-${h.decision === 'approved' ? 'approved' : 'declined'}`}>
                    {h.decision}
                  </span>
                </td>
                <td className="muted">{h.manager_note || '—'}</td>
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
