import { db } from '../db.js'

export function currentMonthYear(now = new Date()) {
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() }
}

export function getMonthlySpend(cardId, { month, year } = currentMonthYear()) {
  const row = db
    .prepare(
      'SELECT total_spent_cents FROM monthly_spend WHERE card_id = ? AND month = ? AND year = ?',
    )
    .get(cardId, month, year)
  return row ? row.total_spent_cents : 0
}

export function addToMonthlySpend(cardId, amountCents, when = currentMonthYear()) {
  const { month, year } = when
  const existing = db
    .prepare(
      'SELECT id, total_spent_cents FROM monthly_spend WHERE card_id = ? AND month = ? AND year = ?',
    )
    .get(cardId, month, year)
  if (existing) {
    db.prepare('UPDATE monthly_spend SET total_spent_cents = ? WHERE id = ?').run(
      existing.total_spent_cents + amountCents,
      existing.id,
    )
  } else {
    db.prepare(
      'INSERT INTO monthly_spend (card_id, month, year, total_spent_cents) VALUES (?, ?, ?, ?)',
    ).run(cardId, month, year, amountCents)
  }
}

export function spendSummary(card) {
  const spent = getMonthlySpend(card.id)
  const remaining = Math.max(card.spend_limit_cents - spent, 0)
  const utilization =
    card.spend_limit_cents > 0
      ? Math.min(100, Math.round((spent / card.spend_limit_cents) * 100))
      : 0
  return {
    spent_this_month_cents: spent,
    remaining_cents: remaining,
    utilization_percent: utilization,
  }
}
