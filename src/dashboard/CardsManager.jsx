import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const EMPTY_FORM = {
  card_name: '',
  employee_id: '',
  approver_id: '',
  card_type: 'physical',
  spend_limit_dollars: '',
  status: 'active',
  blocked: '',
}

export default function CardsManager({ cards, employees, onChange }) {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (editingId) {
      const c = cards.find((x) => x.id === editingId)
      if (c) {
        setForm({
          card_name: c.card_name,
          employee_id: String(c.employee_id),
          approver_id: c.approver_id ? String(c.approver_id) : '',
          card_type: c.card_type,
          spend_limit_dollars: (c.spend_limit_cents / 100).toFixed(2),
          status: c.status,
          blocked: (c.blocked_categories || []).join(', '),
        })
        setShowForm(true)
      }
    }
  }, [editingId, cards])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError(null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const payload = {
        card_name: form.card_name.trim(),
        employee_id: Number(form.employee_id),
        approver_id: form.approver_id ? Number(form.approver_id) : null,
        card_type: form.card_type,
        spend_limit_cents: Math.round(Number(form.spend_limit_dollars) * 100),
        status: form.status,
        blocked_categories: form.blocked
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      }
      if (editingId) {
        await api.updateCard(editingId, payload)
      } else {
        await api.createCard(payload)
      }
      await onChange()
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this card? This cannot be undone.')) return
    setBusy(true)
    setError(null)
    try {
      await api.deleteCard(id)
      await onChange()
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="dash-card">
      <header className="dash-card-head dash-card-head-row">
        <div>
          <h2>Cards</h2>
          <p>Issue, edit, freeze, or remove cards. Set who approves &gt; $500 charges.</p>
        </div>
        <button
          type="button"
          className="btn btn-lime"
          onClick={() => {
            resetForm()
            setShowForm((v) => !v)
          }}
        >
          {showForm && !editingId ? 'Close' : '+ New card'}
        </button>
      </header>

      {error && (
        <div className="txn-banner txn-banner-bad" role="alert">
          <strong>✗</strong>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form className="txn-form card-form" onSubmit={onSubmit}>
          <label>
            <span>Card name</span>
            <input
              required
              value={form.card_name}
              onChange={(e) => setForm({ ...form, card_name: e.target.value })}
              placeholder="Raja Ops Card"
            />
          </label>
          <label>
            <span>Cardholder</span>
            <select
              required
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            >
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Approver (for &gt;$500)</span>
            <select
              value={form.approver_id}
              onChange={(e) => setForm({ ...form, approver_id: e.target.value })}
            >
              <option value="">Use cardholder's manager</option>
              {employees
                .filter((e) => e.role === 'manager')
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.department}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <select
              value={form.card_type}
              onChange={(e) => setForm({ ...form, card_type: e.target.value })}
            >
              <option value="physical">Physical</option>
              <option value="virtual">Virtual ($200/txn cap)</option>
            </select>
          </label>
          <label>
            <span>Monthly limit (USD)</span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={form.spend_limit_dollars}
              onChange={(e) => setForm({ ...form, spend_limit_dollars: e.target.value })}
              placeholder="5000.00"
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </label>
          <label className="card-form-wide">
            <span>Blocked categories (comma-separated)</span>
            <input
              value={form.blocked}
              onChange={(e) => setForm({ ...form, blocked: e.target.value })}
              placeholder="gambling, entertainment"
            />
          </label>
          <div className="card-form-actions">
            <button type="submit" className="btn btn-lime" disabled={busy}>
              {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create card'}
            </button>
            <button
              type="button"
              className="btn btn-ghost-dark"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Cardholder</th>
              <th>Approver</th>
              <th>Type</th>
              <th>Limit</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">No cards yet — add one above.</td>
              </tr>
            )}
            {cards.map((c) => (
              <tr key={c.id}>
                <td>{c.card_name}</td>
                <td>{c.employee?.name}</td>
                <td>{c.approver?.name || <span className="muted">—</span>}</td>
                <td className="cap">{c.card_type}</td>
                <td>{c.spend_limit_display}</td>
                <td>
                  <span className={`pill pill-${c.status}`}>{c.status}</span>
                </td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setEditingId(c.id)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-link btn-link-danger"
                    onClick={() => onDelete(c.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
