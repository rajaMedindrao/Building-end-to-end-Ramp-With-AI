import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function DbInspector() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.listTables().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <section className="dash-card">
        <header className="dash-card-head"><h2>Database</h2></header>
        <div className="txn-banner txn-banner-bad"><span>{error}</span></div>
      </section>
    )
  }
  if (!data) return null

  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>Database</h2>
        <p>SQLite at <code>{data.db_path}</code>. Live row counts below.</p>
      </header>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Rows</th>
              <th>Columns</th>
            </tr>
          </thead>
          <tbody>
            {data.tables.map((t) => (
              <tr key={t.name}>
                <td><strong>{t.name}</strong></td>
                <td>{t.row_count}</td>
                <td className="muted">
                  {t.columns.map((c) => `${c.name} ${c.type}${c.pk ? ' PK' : ''}`).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
