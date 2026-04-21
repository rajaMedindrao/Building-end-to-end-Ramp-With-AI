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

export default router
