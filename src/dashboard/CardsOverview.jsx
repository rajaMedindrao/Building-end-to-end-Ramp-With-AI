export default function CardsOverview({ cards }) {
  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>Cards overview</h2>
        <p>Live monthly utilization across every card.</p>
      </header>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Employee</th>
              <th>Type</th>
              <th>Limit</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td>{c.card_name}</td>
                <td>{c.employee?.name}</td>
                <td className="cap">{c.card_type}</td>
                <td>{c.spend_limit_display}</td>
                <td>{c.spent_display}</td>
                <td>{c.remaining_display}</td>
                <td>
                  <UtilBar pct={c.utilization_percent} />
                </td>
                <td>
                  <span className={`pill pill-${c.status}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function UtilBar({ pct }) {
  const tone = pct >= 90 ? 'red' : pct >= 70 ? 'amber' : 'green'
  return (
    <div className="util">
      <div className={`util-bar util-${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
      <span className="util-pct">{pct}%</span>
    </div>
  )
}
