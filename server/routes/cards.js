import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { spendSummary } from '../services/spendTracker.js'

const router = Router()

function dollars(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function withSummary(card) {
  const summary = spendSummary(card)
  const employee = db.prepare('SELECT id, name, department FROM employees WHERE id = ?').get(card.employee_id)
  const approver = card.approver_id
    ? db.prepare('SELECT id, name, department FROM employees WHERE id = ?').get(card.approver_id)
    : null
  return {
    id: card.id,
    card_id: card.id,
    card_name: card.card_name,
    card_type: card.card_type,
    status: card.status,
    blocked_categories: JSON.parse(card.blocked_categories || '[]'),
    spend_limit_cents: card.spend_limit_cents,
    spend_limit_display: dollars(card.spend_limit_cents),
    spent_this_month_cents: summary.spent_this_month_cents,
    spent_display: dollars(summary.spent_this_month_cents),
    remaining_cents: summary.remaining_cents,
    remaining_display: dollars(summary.remaining_cents),
    utilization_percent: summary.utilization_percent,
    employee,
    approver,
    employee_id: card.employee_id,
    approver_id: card.approver_id,
  }
}

router.get('/', requireAuth, (_req, res) => {
  const cards = db.prepare('SELECT * FROM cards ORDER BY id').all()
  res.json({ cards: cards.map(withSummary) })
})

router.get('/:id/spend-summary', requireAuth, (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(Number(req.params.id))
  if (!card) return res.status(404).json({ error: 'Card not found' })
  res.json(withSummary(card))
})

function validateCardPayload(body, { partial = false } = {}) {
  const out = {}
  const errors = []
  if (!partial || body.card_name !== undefined) {
    const name = String(body.card_name || '').trim()
    if (!name) errors.push('card_name is required')
    out.card_name = name
  }
  if (!partial || body.employee_id !== undefined) {
    const id = Number(body.employee_id)
    if (!id) errors.push('employee_id is required')
    out.employee_id = id
  }
  if (!partial || body.approver_id !== undefined) {
    const approverId = body.approver_id ? Number(body.approver_id) : null
    if (approverId) {
      // Approver must exist and be a manager — otherwise an over-$500 charge
      // on this card would land in a queue nobody is authorized to clear,
      // leaving the transaction stuck in pending_approval forever.
      const approver = db
        .prepare("SELECT id, role FROM employees WHERE id = ?")
        .get(approverId)
      if (!approver) errors.push('approver_id does not exist')
      else if (approver.role !== 'manager') errors.push('approver must be a manager')
    }
    out.approver_id = approverId
  }
  if (!partial || body.spend_limit_cents !== undefined) {
    const limit = Math.round(Number(body.spend_limit_cents))
    if (!Number.isFinite(limit) || limit <= 0) errors.push('spend_limit_cents must be positive')
    out.spend_limit_cents = limit
  }
  if (!partial || body.card_type !== undefined) {
    const type = String(body.card_type || 'physical')
    if (!['physical', 'virtual'].includes(type)) errors.push('card_type must be physical or virtual')
    out.card_type = type
  }
  if (!partial || body.status !== undefined) {
    const status = String(body.status || 'active')
    if (!['active', 'frozen'].includes(status)) errors.push('status must be active or frozen')
    out.status = status
  }
  if (!partial || body.blocked_categories !== undefined) {
    const list = Array.isArray(body.blocked_categories) ? body.blocked_categories : []
    out.blocked_categories = JSON.stringify(list.map((s) => String(s).toLowerCase()))
  }
  return { value: out, errors }
}

router.post('/', requireAuth, (req, res) => {
  // Only managers can mint cards.
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can create cards' })
  }
  const { value, errors } = validateCardPayload(req.body || {})
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })
  const info = db
    .prepare(
      `INSERT INTO cards
       (employee_id, approver_id, card_name, card_type, spend_limit_cents, status, blocked_categories)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      value.employee_id,
      value.approver_id,
      value.card_name,
      value.card_type,
      value.spend_limit_cents,
      value.status,
      value.blocked_categories,
    )
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(withSummary(card))
})

router.put('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can update cards' })
  }
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM cards WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Card not found' })
  const { value, errors } = validateCardPayload(req.body || {}, { partial: true })
  if (errors.length) return res.status(400).json({ error: errors.join('; ') })

  const fields = Object.keys(value)
  if (fields.length === 0) return res.json(withSummary(existing))
  const sets = fields.map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE cards SET ${sets} WHERE id = ?`).run(...fields.map((f) => value[f]), id)
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id)
  res.json(withSummary(card))
})

router.delete('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can delete cards' })
  }
  const id = Number(req.params.id)
  // Don't orphan transactions / monthly_spend rows. Block deletion if the
  // card has any history; the manager can freeze it instead.
  const txnCount = db.prepare('SELECT COUNT(*) AS c FROM transactions WHERE card_id = ?').get(id).c
  if (txnCount > 0) {
    return res.status(409).json({
      error: 'Card has transactions. Freeze it instead of deleting.',
    })
  }
  const info = db.prepare('DELETE FROM cards WHERE id = ?').run(id)
  if (info.changes === 0) return res.status(404).json({ error: 'Card not found' })
  res.json({ ok: true })
})

export default router
