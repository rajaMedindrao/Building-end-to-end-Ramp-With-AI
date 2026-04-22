import { db } from '../db.js'
import { addToMonthlySpend, getMonthlySpend } from './spendTracker.js'

const VIRTUAL_TXN_CAP_CENTS = 20000 // $200.00

function parseBlocked(json) {
  try {
    const v = JSON.parse(json || '[]')
    return Array.isArray(v) ? v.map((s) => String(s).toLowerCase()) : []
  } catch {
    return []
  }
}

function dollars(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Run the spec's 5-rule engine in strict order. Returns one of:
 *   { outcome: 'declined', reason }
 *   { outcome: 'approved' }                 // caller writes the txn + spend
 *   { outcome: 'pending_approval', manager } // caller writes txn + approval row
 */
export function evaluateTransaction({ card, amountCents, merchantCategory }) {
  // Rule 1: Card must be active
  if (card.status === 'frozen') {
    return { outcome: 'declined', reason: 'Card is frozen' }
  }

  // Rule 2: Merchant category must not be blocked
  const blocked = parseBlocked(card.blocked_categories)
  if (blocked.includes(String(merchantCategory).toLowerCase())) {
    return { outcome: 'declined', reason: 'Merchant category is blocked' }
  }

  // Rule 3: Must not exceed remaining monthly limit
  const spent = getMonthlySpend(card.id)
  const remaining = card.spend_limit_cents - spent
  if (amountCents > remaining) {
    return {
      outcome: 'declined',
      reason: `Exceeds monthly spend limit. Remaining: ${dollars(Math.max(remaining, 0))}`,
    }
  }

  // Rule 4: Virtual cards cap of $200 per transaction
  if (card.card_type === 'virtual' && amountCents > VIRTUAL_TXN_CAP_CENTS) {
    return { outcome: 'declined', reason: 'Virtual cards limited to $200 per transaction' }
  }

  // Rule 5: All transactions must be approved by the card's approver.
  // The card's explicit approver_id wins; otherwise fall back to the
  // cardholder's manager. If no approver exists at all, auto-approve.
  const approverId =
    card.approver_id ||
    db.prepare('SELECT manager_id FROM employees WHERE id = ?').get(card.employee_id)?.manager_id

  if (approverId) {
    const manager = db.prepare('SELECT * FROM employees WHERE id = ?').get(approverId)
    if (!manager) {
      return { outcome: 'declined', reason: 'Configured approver no longer exists' }
    }
    if (manager.role !== 'manager') {
      return { outcome: 'declined', reason: 'Configured approver is not a manager' }
    }
    return { outcome: 'pending_approval', manager }
  }

  return { outcome: 'approved' }
}

/**
 * Persist the result of a fresh transaction submission. Wraps the rules
 * engine plus all writes in a single SQLite transaction so partial state
 * can never be observed by a concurrent reader.
 */
export const submitTransaction = db.transaction(
  ({ card, employeeId, merchantName, merchantCategory, amountCents }) => {
    const result = evaluateTransaction({ card, amountCents, merchantCategory })

    if (result.outcome === 'declined') {
      const info = db
        .prepare(
          `INSERT INTO transactions
           (card_id, employee_id, merchant_name, merchant_category, amount_cents, status, decline_reason)
           VALUES (?, ?, ?, ?, ?, 'declined', ?)`,
        )
        .run(card.id, employeeId, merchantName, merchantCategory, amountCents, result.reason)
      return { status: 'declined', transactionId: info.lastInsertRowid, reason: result.reason }
    }

    if (result.outcome === 'pending_approval') {
      const txnInfo = db
        .prepare(
          `INSERT INTO transactions
           (card_id, employee_id, merchant_name, merchant_category, amount_cents, status)
           VALUES (?, ?, ?, ?, ?, 'pending_approval')`,
        )
        .run(card.id, employeeId, merchantName, merchantCategory, amountCents)
      const approvalInfo = db
        .prepare(
          `INSERT INTO approvals (transaction_id, manager_id, status)
           VALUES (?, ?, 'pending')`,
        )
        .run(txnInfo.lastInsertRowid, result.manager.id)
      db.prepare('UPDATE transactions SET approval_id = ? WHERE id = ?').run(
        approvalInfo.lastInsertRowid,
        txnInfo.lastInsertRowid,
      )
      return {
        status: 'pending_approval',
        transactionId: txnInfo.lastInsertRowid,
        approvalId: approvalInfo.lastInsertRowid,
        managerName: result.manager.name,
      }
    }

    // approved
    const info = db
      .prepare(
        `INSERT INTO transactions
         (card_id, employee_id, merchant_name, merchant_category, amount_cents, status)
         VALUES (?, ?, ?, ?, ?, 'approved')`,
      )
      .run(card.id, employeeId, merchantName, merchantCategory, amountCents)
    addToMonthlySpend(card.id, amountCents)
    const newSpent = getMonthlySpend(card.id)
    return {
      status: 'approved',
      transactionId: info.lastInsertRowid,
      remainingLimitCents: Math.max(card.spend_limit_cents - newSpent, 0),
    }
  },
)
