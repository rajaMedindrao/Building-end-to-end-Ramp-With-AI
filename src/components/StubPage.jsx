import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { TOP_PAGES } from '../routes.js'

const BILLING_MODES = ['monthly', 'annual']
function pickBilling(s) {
  return BILLING_MODES.includes(s) ? s : 'monthly'
}
function resolveByBilling(value, billing) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[billing] ?? value.monthly ?? ''
  }
  return value
}

function BillingToggle({ billing, onChange, savingsLabel }) {
  return (
    <div className="billing-toggle" role="group" aria-label="Billing period">
      {BILLING_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={`billing-opt ${billing === mode ? 'is-active' : ''}`}
          aria-pressed={billing === mode}
          onClick={() => onChange(mode)}
        >
          {mode === 'monthly' ? 'Monthly' : 'Annual'}
          {mode === 'annual' && savingsLabel && (
            <span className="billing-save">{savingsLabel}</span>
          )}
        </button>
      ))}
    </div>
  )
}

const usd = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)))

function SavingsCalculator({ config }) {
  const {
    title,
    intro,
    cashbackRate,
    defaultSpend,
    minSpend = 0,
    maxSpend = 1000000,
    stepSpend = 1000,
    note,
  } = config
  const [spend, setSpend] = useState(defaultSpend)
  const monthly = spend * cashbackRate
  const annual = monthly * 12
  const ratePct = (cashbackRate * 100).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

  const onChange = (e) => {
    const v = Number(e.target.value)
    setSpend(Number.isFinite(v) ? v : 0)
  }

  return (
    <section className="section savings">
      <div className="container">
        <div className="savings-card">
          <div className="savings-copy">
            <h3>{title}</h3>
            <p>{intro}</p>
          </div>
          <div className="savings-controls">
            <label className="savings-input" htmlFor="savings-spend">
              <span>Average monthly card spend</span>
              <div className="savings-input-row">
                <span className="savings-prefix" aria-hidden="true">$</span>
                <input
                  id="savings-spend"
                  type="number"
                  inputMode="numeric"
                  min={minSpend}
                  max={maxSpend}
                  step={stepSpend}
                  value={spend}
                  onChange={onChange}
                />
              </div>
            </label>
            <input
              type="range"
              aria-label="Average monthly card spend slider"
              min={minSpend}
              max={maxSpend}
              step={stepSpend}
              value={Math.min(Math.max(spend, minSpend), maxSpend)}
              onChange={onChange}
              className="savings-range"
            />
          </div>
          <div className="savings-results" aria-live="polite">
            <div className="savings-stat">
              <span className="savings-stat-label">Estimated monthly cashback</span>
              <span className="savings-stat-value">{usd(monthly)}</span>
            </div>
            <div className="savings-stat savings-stat-hl">
              <span className="savings-stat-label">Estimated annual cashback</span>
              <span className="savings-stat-value">{usd(annual)}</span>
            </div>
          </div>
          <p className="savings-note">{note || `Estimates use a ${ratePct}% cashback rate.`}</p>
        </div>
      </div>
    </section>
  )
}

function Cell({ value }) {
  if (value === true) return <span className="cmp-yes" aria-label="Included">✓</span>
  if (value === false) return <span className="cmp-no" aria-label="Not included">—</span>
  return <span className="cmp-text">{value}</span>
}

function ComparisonTable({ data, billingRow }) {
  const groups = billingRow
    ? [{ title: billingRow.title, rows: [billingRow.row] }, ...data.groups]
    : data.groups
  return (
    <div className="cmp-wrap">
      <table className="cmp">
        <caption className="sr-only">
          Feature comparison across Ramp, Ramp Plus, and Ramp Enterprise plans.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="cmp-feat-h">Feature</th>
            {data.columns.map((c, i) => (
              <th key={c} scope="col" className={i === 1 ? 'cmp-hl' : ''}>{c}</th>
            ))}
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.title}>
            <tr className="cmp-group">
              <th scope="rowgroup" colSpan={data.columns.length + 1}>{g.title}</th>
            </tr>
            {g.rows.map(([feat, ...vals]) => (
              <tr key={`${g.title}-${feat}`}>
                <th scope="row" className="cmp-feat">{feat}</th>
                {vals.map((v, i) => (
                  <td key={i} className={i === 1 ? 'cmp-hl' : ''}>
                    <Cell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <details className="faq-item" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span>{q}</span>
        <span className="faq-toggle" aria-hidden="true">{open ? '–' : '+'}</span>
      </summary>
      <p>{a}</p>
    </details>
  )
}

function titleize(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function StubPage() {
  const { pathname } = useLocation()
  const top = TOP_PAGES[pathname]
  if (top) return <TopPage page={top} />

  // Footer / sub‑page: derive eyebrow + title from the URL path.
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)
  const eyebrow = parts.length > 1 ? titleize(parts[0]) : 'Page'
  const title = titleize(parts[parts.length - 1] || 'Page')

  return (
    <main className="page-stub">
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow light">{eyebrow}</p>
          <h1>{title}.</h1>
          <p className="page-intro">
            This is a placeholder page wired up so the {eyebrow.toLowerCase()}{' '}
            navigation works end‑to‑end. Real content goes here next.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container page-body">
          <h2>What you’ll find here</h2>
          <p>
            The {title} page is part of Ramp’s {eyebrow.toLowerCase()}{' '}
            section. Use the links in the footer to explore other pages, or
            head back to the homepage to see the full product story.
          </p>
          <Link to="/" className="btn btn-dark">← Back to home</Link>
        </div>
      </section>
    </main>
  )
}

function TopPage({ page }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const billing = pickBilling(searchParams.get('billing'))
  const setBilling = (next) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'monthly') params.delete('billing')
    else params.set('billing', next)
    setSearchParams(params, { replace: true })
  }
  const showBillingToggle = !!page.plans && !!page.billingToggle
  const billingRow = page.billingPricing
    ? { title: page.billingPricing.title, row: page.billingPricing[billing] }
    : null

  return (
    <main className="page-stub">
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow light">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-intro">{page.intro}</p>
          <div className="page-cta">
            <Link to="/get-started" className="btn btn-lime">Get started for free</Link>
            <Link to="/" className="link-light arrow">Back to home →</Link>
          </div>
        </div>
      </section>

      {page.cards && (
        <section className="section">
          <div className="container">
            <div className="page-cards">
              {page.cards.map(([title, body]) => (
                <article key={title} className="page-card">
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.plans && (
        <section className="section">
          <div className="container">
            {showBillingToggle && (
              <BillingToggle
                billing={billing}
                onChange={setBilling}
                savingsLabel={page.billingToggle.savingsLabel}
              />
            )}
            <div className="plans">
              {page.plans.map((p) => {
                const priceText = resolveByBilling(p.price, billing)
                const lineText = resolveByBilling(p.line, billing)
                const isContact = priceText === 'Talk to us'
                return (
                  <article key={p.name} className={`plan ${p.highlight ? 'plan-hl' : ''}`}>
                    <h3>{p.name}</h3>
                    <div className="plan-price">{priceText}</div>
                    <p className="plan-line">{lineText}</p>
                    <ul>
                      {p.features.map((f) => (
                        <li key={f}><span className="plan-check">✓</span>{f}</li>
                      ))}
                    </ul>
                    <Link to="/get-started" className={`btn ${p.highlight ? 'btn-lime' : 'btn-dark'}`}>
                      {isContact ? 'Contact sales' : 'Get started'}
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {page.comparison && (
        <section className="section pricing-cmp">
          <div className="container">
            <div className="section-head center reveal">
              <h2>Compare every plan</h2>
              <p>The full feature list, side by side. No asterisks.</p>
            </div>
            <ComparisonTable data={page.comparison} billingRow={billingRow} />
          </div>
        </section>
      )}

      {page.savingsCalculator && (
        <SavingsCalculator config={page.savingsCalculator} />
      )}

      {page.faqs && (
        <section className="section pricing-faq">
          <div className="container">
            <div className="section-head center reveal">
              <h2>Pricing questions, answered</h2>
              <p>Everything teams ask before they switch to Ramp.</p>
            </div>
            <div className="faq-list">
              {page.faqs.map((f, i) => (
                <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {page.form && (
        <section className="section">
          <div className="container">
            <form
              className="page-form"
              onSubmit={(e) => { e.preventDefault(); alert('Thanks! This is a demo page.') }}
            >
              <label>
                Work email
                <input type="email" required placeholder="you@company.com" />
              </label>
              {page.form === 'sign-in' && (
                <label>
                  Password
                  <input type="password" required placeholder="••••••••" />
                </label>
              )}
              <button type="submit" className="btn btn-lime">
                {page.form === 'sign-in' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  )
}
