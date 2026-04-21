import { Link, useLocation } from 'react-router-dom'
import { TOP_PAGES } from '../routes.js'

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
