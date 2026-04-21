import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOP_PAGES } from '../routes.js'

function Cell({ value }) {
  if (value === true) return <span className="cmp-yes" aria-label="Included">✓</span>
  if (value === false) return <span className="cmp-no" aria-label="Not included">—</span>
  return <span className="cmp-text">{value}</span>
}

function ComparisonTable({ data }) {
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
        {data.groups.map((g) => (
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
            <div className="plans">
              {page.plans.map((p) => (
                <article key={p.name} className={`plan ${p.highlight ? 'plan-hl' : ''}`}>
                  <h3>{p.name}</h3>
                  <div className="plan-price">{p.price}</div>
                  <p className="plan-line">{p.line}</p>
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}><span className="plan-check">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Link to="/get-started" className={`btn ${p.highlight ? 'btn-lime' : 'btn-dark'}`}>
                    {p.price === 'Talk to us' ? 'Contact sales' : 'Get started'}
                  </Link>
                </article>
              ))}
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
            <ComparisonTable data={page.comparison} />
          </div>
        </section>
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
