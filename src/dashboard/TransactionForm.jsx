import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const CATEGORIES = [
  'software',
  'travel',
  'meals',
  'entertainment',
  'office supplies',
  'gambling',
  'hardware',
  'marketing',
]

export default function TransactionForm({ cards, onSubmitted }) {
  const [cardId, setCardId] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!cardId && cards.length) setCardId(String(cards[0].id))
  }, [cards, cardId])

  async function onSubmit(e) {
    e.preventDefault()
    if (!cardId || !merchant || !amount) return
    setBusy(true)
    setResult(null)
    try {
      const cents = Math.round(Number(amount) * 100)
      const r = await api.submitTransaction({
        card_id: Number(cardId),
        merchant_name: merchant.trim(),
        merchant_category: category,
        amount_cents: cents,
      })
      setResult(r)
      setMerchant('')
      setAmount('')
      onSubmitted?.()
    } catch (err) {
      setResult({ status: 'error', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="dash-card">
      <header className="dash-card-head">
        <h2>Submit transaction</h2>
        <p>Run a charge through the rules engine.</p>
      </header>
      <form className="txn-form" onSubmit={onSubmit}>
        <label>
          <span>Card</span>
          <select value={cardId} onChange={(e) => setCardId(e.target.value)} required>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.card_name} — {c.employee?.name} ({c.remaining_display} left)
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Merchant</span>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="AWS"
            required
          />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Amount (USD)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="125.00"
            required
          />
        </label>
        <button type="submit" className="btn btn-lime" disabled={busy}>
          {busy ? 'Processing…' : 'Process transaction'}
        </button>
      </form>
      {result && <ResultBanner result={result} />}
    </section>
  )
}

function ResultBanner({ result }) {
  const cls =
    result.status === 'approved'
      ? 'ok'
      : result.status === 'pending_approval'
        ? 'pending'
        : 'bad'
  const icon = result.status === 'approved' ? '✓' : result.status === 'pending_approval' ? '⏳' : '✗'
  return (
    <div className={`txn-banner txn-banner-${cls}`} role="status">
      <strong>
        {icon} {result.status.replace('_', ' ')}
      </strong>
      <span>{result.message}</span>
    </div>
  )
}
