import { useState } from 'react'
import { api } from '../api/client.js'

export default function ApprovalQueue({ managerId, managerName, approvals, onChange, onToast }) {
  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>
          Approval queue{' '}
          <span className="dash-badge">{approvals.length} pending</span>
        </h2>
        <p>
          Reviewing as <strong>{managerName || '—'}</strong>. All charges routed to you land here.
        </p>
      </header>
      {approvals.length === 0 ? (
        <p className="empty">Nothing waiting on this manager.</p>
      ) : (
        <ul className="approval-list">
          {approvals.map((a) => (
            <ApprovalCard
              key={a.approval_id}
              approval={a}
              managerId={managerId}
              onChange={onChange}
              onToast={onToast}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function ApprovalCard({ approval, managerId, onChange, onToast }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [leaving, setLeaving] = useState(false)

  async function decide(decision) {
    setBusy(true)
    setError(null)
    try {
      await api.decideApproval(approval.approval_id, {
        manager_id: managerId,
        decision,
        manager_note: note || null,
      })
      setLeaving(true)
      onToast?.({ kind: decision === 'approved' ? 'ok' : 'bad', text: decision === 'approved' ? 'Approved' : 'Rejected' })
      setTimeout(() => onChange?.(), 250)
    } catch (err) {
      setBusy(false)
      setError(err.message)
    }
  }

  return (
    <li className={`approval-item ${leaving ? 'is-leaving' : ''}`}>
      <div className="approval-top">
        <div>
          <strong>{approval.employee_name}</strong>
          <span className="muted"> · {approval.employee_department}</span>
        </div>
        <span className="muted">{formatDate(approval.requested_at)}</span>
      </div>
      <div className="approval-mid">
        <div className="approval-merchant">
          <div className="approval-merchant-name">{approval.merchant_name}</div>
          <div className="muted cap">{approval.merchant_category}</div>
        </div>
        <div className="approval-amount">{approval.amount_display}</div>
      </div>
      <div className="muted approval-card-line">
        {approval.card_name} · remaining if approved:{' '}
        <strong>{approval.card_remaining_after_approval_display}</strong>
      </div>
      <div className="approval-actions">
        <input
          type="text"
          placeholder="Optional note for the employee"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="btn btn-approve"
          onClick={() => decide('approved')}
          disabled={busy}
        >
          Approve {approval.amount_display}
        </button>
        <button
          type="button"
          className="btn btn-reject"
          onClick={() => decide('rejected')}
          disabled={busy}
        >
          Reject
        </button>
      </div>
      {error && <p className="auth-error">{error}</p>}
    </li>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T') + 'Z')
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}
