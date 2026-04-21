import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { submitTransaction } from '../services/rulesEngine.js'

const router = Router()

function dollars(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

router.post('/submit', requireAuth, (req, res) => {
  const { card_id, merchant_name, merchant_category, amount_cents } = req.body || {}
  const cardId = Number(card_id)
  const amount = Number(amount_cents)
  if (!cardId || !merchant_name || !merchant_category || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      error: 'card_id, merchant_name, merchant_category, and positive amount_cents are required',
    })
  }
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(cardId)
  if (!card) return res.status(404).json({ error: 'Card not found' })

  const result = submitTransaction({
    card,
    employeeId: card.employee_id,
    merchantName: String(merchant_name).trim(),
    merchantCategory: String(merchant_category).trim().toLowerCase(),
    amountCents: Math.round(amount),
  })

  if (result.status === 'approved') {
    return res.json({
      status: 'approved',
      transaction_id: result.transactionId,
      message: `Transaction approved. ${dollars(amount)} charged.`,
      remaining_limit_cents: result.remainingLimitCents,
      remaining_limit_display: dollars(result.remainingLimitCents),
    })
  }
  if (result.status === 'declined') {
    return res.json({
      status: 'declined',
      transaction_id: result.transactionId,
      message: result.reason,
      decline_reason: result.reason,
    })
  }
  return res.json({
    status: 'pending_approval',
    transaction_id: result.transactionId,
    approval_id: result.approvalId,
    message: `Amount over $500. Sent to ${result.managerName} for approval.`,
    manager_name: result.managerName,
  })
})

router.get('/', requireAuth, (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5))
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const total = db.prepare('SELECT COUNT(*) AS c FROM transactions').get().c
  const rows = db
    .prepare(
      `SELECT t.*, c.card_name, e.name AS employee_name
       FROM transactions t
       JOIN cards c ON c.id = t.card_id
       JOIN employees e ON e.id = t.employee_id
       ORDER BY t.id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset)
  res.json({
    total,
    limit,
    offset,
    transactions: rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      card_id: r.card_id,
      card_name: r.card_name,
      employee_name: r.employee_name,
      merchant_name: r.merchant_name,
      merchant_category: r.merchant_category,
      amount_cents: r.amount_cents,
      amount_display: dollars(r.amount_cents),
      status: r.status,
      decline_reason: r.decline_reason,
    })),
  })
})

export default router
