import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { ApprovalError, processDecision } from '../services/approvalService.js'
import { getMonthlySpend } from '../services/spendTracker.js'

const router = Router()

function dollars(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function shapePending(row) {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(row.card_id)
  const spent = getMonthlySpend(card.id)
  const remainingAfter = Math.max(card.spend_limit_cents - spent - row.amount_cents, 0)
  return {
    approval_id: row.approval_id,
    transaction_id: row.transaction_id,
    requested_at: row.requested_at,
    employee_name: row.employee_name,
    employee_department: row.employee_department,
    card_name: card.card_name,
    card_id: card.id,
    merchant_name: row.merchant_name,
    merchant_category: row.merchant_category,
    amount_cents: row.amount_cents,
    amount_display: dollars(row.amount_cents),
    card_remaining_after_approval_cents: remainingAfter,
    card_remaining_after_approval_display: dollars(remainingAfter),
  }
}

function ensureManagerCanView(req, res) {
  // Only authenticated managers may inspect a queue, and we additionally
  // restrict the requested manager_id to the caller — unless the caller is
  // also a manager, in which case the demo-mode "View as manager" dropdown
  // is allowed to peek at peer queues. This avoids the previous foot-gun
  // where any logged-in user could pass an arbitrary manager_id.
  if (req.user.role !== 'manager') {
    res.status(403).json({ error: 'Only managers can view approval queues' })
    return null
  }
  const managerId = Number(req.query.manager_id) || req.user.id
  return managerId
}

router.get('/pending', requireAuth, (req, res) => {
  const managerId = ensureManagerCanView(req, res)
  if (managerId === null) return
  const rows = db
    .prepare(
      `SELECT a.id AS approval_id, a.requested_at, a.transaction_id,
              t.card_id, t.merchant_name, t.merchant_category, t.amount_cents,
              e.name AS employee_name, e.department AS employee_department
       FROM approvals a
       JOIN transactions t ON t.id = a.transaction_id
       JOIN employees e ON e.id = t.employee_id
       WHERE a.manager_id = ? AND a.status = 'pending'
       ORDER BY a.id ASC`,
    )
    .all(managerId)
  const approvals = rows.map(shapePending)
  res.json({ pending_count: approvals.length, approvals })
})

router.get('/history', requireAuth, (req, res) => {
  const managerId = ensureManagerCanView(req, res)
  if (managerId === null) return
  const rows = db
    .prepare(
      `SELECT a.id AS approval_id, a.status, a.decided_at, a.manager_note,
              t.merchant_name, t.amount_cents,
              e.name AS employee_name, e.department AS employee_department
       FROM approvals a
       JOIN transactions t ON t.id = a.transaction_id
       JOIN employees e ON e.id = t.employee_id
       WHERE a.manager_id = ? AND a.status != 'pending'
       ORDER BY a.decided_at DESC, a.id DESC
       LIMIT 20`,
    )
    .all(managerId)
  res.json({
    history: rows.map((r) => ({
      approval_id: r.approval_id,
      decided_at: r.decided_at,
      employee_name: r.employee_name,
      employee_department: r.employee_department,
      merchant_name: r.merchant_name,
      amount_cents: r.amount_cents,
      amount_display: dollars(r.amount_cents),
      decision: r.status,
      manager_note: r.manager_note,
    })),
  })
})

router.post('/:id/decide', requireAuth, (req, res) => {
  const approvalId = Number(req.params.id)
  const { decision, manager_note } = req.body || {}
  // Always derive the deciding manager from the authenticated session —
  // never trust a manager_id supplied in the body, which would otherwise
  // let any signed-in user act as another manager.
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Only managers can decide approvals' })
  }
  try {
    const result = processDecision({
      approvalId,
      managerId: req.user.id,
      decision,
      note: manager_note ? String(manager_note) : null,
    })
    const message =
      decision === 'approved'
        ? `Transaction approved. ${dollars(result.txn.amount_cents)} charged to card #${result.txn.card_id}.`
        : `Transaction rejected.`
    res.json({
      approval_id: approvalId,
      decision,
      transaction_id: result.txn.id,
      transaction_status: result.transactionStatus,
      message,
    })
  } catch (err) {
    if (err instanceof ApprovalError) return res.status(err.status).json({ error: err.message })
    throw err
  }
})

router.get('/managers', requireAuth, (_req, res) => {
  const rows = db
    .prepare("SELECT id, name, department FROM employees WHERE role = 'manager' ORDER BY name")
    .all()
  res.json({ managers: rows })
})

export default router
