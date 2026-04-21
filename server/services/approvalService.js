import { db } from '../db.js'
import { addToMonthlySpend } from './spendTracker.js'

export class ApprovalError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export const processDecision = db.transaction(({ approvalId, managerId, decision, note }) => {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new ApprovalError('decision must be "approved" or "rejected"', 400)
  }
  const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(approvalId)
  if (!approval) throw new ApprovalError('Approval not found', 404)
  if (approval.manager_id !== managerId) {
    throw new ApprovalError('You are not authorized to approve this transaction', 403)
  }
  if (approval.status !== 'pending') {
    throw new ApprovalError(`Approval already ${approval.status}`, 409)
  }
  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(approval.transaction_id)
  if (!txn) throw new ApprovalError('Transaction not found', 404)

  db.prepare(
    "UPDATE approvals SET status = ?, decided_at = CURRENT_TIMESTAMP, manager_note = ? WHERE id = ?",
  ).run(decision, note ?? null, approvalId)

  if (decision === 'approved') {
    db.prepare("UPDATE transactions SET status = 'approved' WHERE id = ?").run(txn.id)
    addToMonthlySpend(txn.card_id, txn.amount_cents)
    return { transactionStatus: 'approved', txn }
  } else {
    const reason = note ? `Rejected by manager: ${note}` : 'Rejected by manager'
    db.prepare(
      "UPDATE transactions SET status = 'declined', decline_reason = ? WHERE id = ?",
    ).run(reason, txn.id)
    return { transactionStatus: 'declined', txn }
  }
})
