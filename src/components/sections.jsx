import { useState, useEffect } from 'react'
import { useParallax } from '../hooks/useMotion.js'

export function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(max-width: 980px)')
    const onChange = (e) => { if (!e.matches) setOpen(false) }
    mql.addEventListener
      ? mql.addEventListener('change', onChange)
      : mql.addListener(onChange)
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener('change', onChange)
        : mql.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const links = [
    ['Product', true],
    ['Customers', true],
    ['Pricing', false],
    ['Resources', true],
    ['Company', true],
  ]

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="logo" href="#">ramp</a>
        <nav className="nav-links">
          {links.map(([label, caret]) => (
            <a key={label} href="#">
              {label} {caret && <span className="caret">▾</span>}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <a href="#" className="link-light">Sign in</a>
          <button className="btn btn-lime">Get started</button>
        </div>
        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div
        className={`nav-mobile ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        {...(!open ? { inert: '' } : {})}
      >
        <nav className="nav-mobile-links">
          {links.map(([label]) => (
            <a key={label} href="#" onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="nav-mobile-cta">
          <a href="#" className="link-light" onClick={() => setOpen(false)}>Sign in</a>
          <button className="btn btn-lime" onClick={() => setOpen(false)}>Get started</button>
        </div>
      </div>
    </header>
  )
}

export function Hero() {
  const visualRef = useParallax(0.06)
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>Time is money.<br />Save both.</h1>
          <p>
            Easily control spend, automate busywork, and close your books faster
            with Ramp — the all‑in‑one finance platform that powers smarter,
            more efficient companies.
          </p>
          <div className="hero-actions">
            <button className="btn btn-lime">Get started for free</button>
            <a href="#" className="link-light arrow">See a demo →</a>
          </div>
          <p className="hero-fineprint">
            4.8 rating on G2 · Trusted by 30,000+ businesses
          </p>
        </div>
        <div className="hero-visual">
          <div className="hero-parallax" ref={visualRef}>
            <div className="hero-float">
              <ProductMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductMock() {
  return (
    <div className="prodmock">
      <div className="prodmock-window">
        <div className="prodmock-toolbar">
          <span /><span /><span />
        </div>
        <div className="prodmock-body">
          <div className="prodmock-side">
            <div className="pm-logo">ramp</div>
            <ul>
              <li className="active">Dashboard</li>
              <li>Cards</li>
              <li>Bills</li>
              <li>Reimburse</li>
              <li>Travel</li>
              <li>Accounting</li>
            </ul>
          </div>
          <div className="prodmock-main">
            <div className="pm-row pm-head">
              <div>
                <div className="pm-label">Cash balance</div>
                <div className="pm-value">$248,310.42</div>
              </div>
              <div>
                <div className="pm-label">Spend this month</div>
                <div className="pm-value pm-value-sm">$84,920</div>
              </div>
            </div>
            <div className="pm-chart">
              <svg viewBox="0 0 320 80" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#11342e"
                  strokeWidth="2"
                  points="0,60 30,55 60,40 90,42 120,28 150,32 180,18 210,22 240,12 270,18 300,8 320,12"
                />
                <polyline
                  fill="rgba(17,52,46,0.08)"
                  stroke="none"
                  points="0,60 30,55 60,40 90,42 120,28 150,32 180,18 210,22 240,12 270,18 300,8 320,12 320,80 0,80"
                />
              </svg>
            </div>
            <div className="pm-tx">
              {[
                ['AWS', '$2,143.00', 'Software'],
                ['United Airlines', '$642.10', 'Travel'],
                ['Notion Labs', '$96.00', 'Software'],
                ['Sweetgreen', '$48.30', 'Meals'],
              ].map(([n, a, c], i) => (
                <div className="pm-tx-row" key={i}>
                  <div className="pm-tx-dot" style={{ background: ['#1d5247','#d8ff3d','#ff7a3c','#b9d4ff'][i] }} />
                  <div className="pm-tx-name">{n}</div>
                  <div className="pm-tx-cat">{c}</div>
                  <div className="pm-tx-amt">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="prodmock-card">
        <div className="cc-top">
          <div className="cc-chip" />
          <div className="cc-brand">ramp</div>
        </div>
        <div className="cc-num">•••• •••• •••• 4242</div>
        <div className="cc-foot">
          <span>SARA CHEN</span>
          <span>VISA</span>
        </div>
      </div>
    </div>
  )
}

export function LogosStrip() {
  const logos = ['SHOPIFY', 'BARRY\'S', 'STRIPE', 'POSHMARK', 'WAYFAIR', 'CLUBHOUSE', 'ZOLA']
  return (
    <section className="logos-strip">
      <div className="container">
        <p className="logos-eyebrow">Trusted by 30,000+ teams shaping the future of finance</p>
        <div className="logos-row reveal">
          {logos.map(l => <span key={l} className="logo-pill">{l}</span>)}
        </div>
      </div>
    </section>
  )
}

export function LunchBreak() {
  return (
    <section className="section lunch">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow">Why Ramp</p>
          <h2>Give your finance team their lunch break back.</h2>
          <p className="section-sub">
            Replace clunky spreadsheets and disconnected tools with one finance
            platform that handles cards, bills, expenses, accounting, and more.
          </p>
        </div>
        <div className="feature-grid reveal-stagger">
          <FeatureCard
            badge="Bill Pay"
            title="Process more invoices with less work."
            body="Capture, code, approve, and pay every bill from one inbox. Ramp does 95% of the work for you."
            visual={<InvoiceMock />}
            tone="cream"
          />
          <FeatureCard
            badge="Corporate Cards"
            title="Issue cards with built‑in controls."
            body="Set per‑card limits, merchant restrictions, and approval flows in seconds."
            visual={<CardStack />}
            tone="dark"
          />
          <FeatureCard
            badge="Expenses"
            title="Manage expenses on autopilot."
            body="Receipts collected, categorized, and submitted — automatically."
            visual={<ExpenseList />}
            tone="cream"
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ badge, title, body, visual, tone }) {
  return (
    <article className={`feat tone-${tone}`}>
      <div className="feat-visual">{visual}</div>
      <div className="feat-text">
        <span className="feat-badge">{badge}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <a href="#" className="feat-link">Learn more →</a>
      </div>
    </article>
  )
}

function InvoiceMock() {
  return (
    <div className="invoice-mock">
      <div className="im-head">
        <div className="im-title">Invoice #INV‑2814</div>
        <span className="im-pill">Approved</span>
      </div>
      <div className="im-row"><span>Vendor</span><strong>Acme Co.</strong></div>
      <div className="im-row"><span>Due</span><strong>Apr 28</strong></div>
      <div className="im-row"><span>Amount</span><strong>$4,820.00</strong></div>
      <div className="im-bar"><div /></div>
      <div className="im-actions"><button className="btn btn-dark">Pay now</button></div>
    </div>
  )
}

function CardStack() {
  return (
    <div className="cardstack">
      <div className="ccx ccx-back" />
      <div className="ccx ccx-mid" />
      <div className="ccx ccx-front">
        <div className="ccx-row"><span className="ccx-chip" /><span className="ccx-brand">ramp</span></div>
        <div className="ccx-num">5412 •••• •••• 0099</div>
        <div className="ccx-foot"><span>MARCO REYES</span><span>04/28</span></div>
      </div>
    </div>
  )
}

function ExpenseList() {
  const items = [
    ['Lyft', 'Travel', '$24.10'],
    ['DoorDash', 'Meals', '$38.20'],
    ['Figma', 'Software', '$15.00'],
    ['Delta', 'Travel', '$420.00'],
  ]
  return (
    <div className="explist">
      <div className="explist-head"><span>Today</span><span className="ex-pill">All synced</span></div>
      {items.map(([n, c, a], i) => (
        <div className="explist-row" key={i}>
          <div className="ex-icon" style={{ background: ['#d8ff3d','#ff7a3c','#b9d4ff','#c8b8ff'][i] }} />
          <div className="ex-name"><strong>{n}</strong><span>{c}</span></div>
          <div className="ex-amt">{a}</div>
        </div>
      ))}
    </div>
  )
}

export function Testimonials() {
  const tiles = [
    { name: 'Priya Shah', role: 'CFO, Glow Labs', quote: 'Ramp closed our books 8 days faster, every month.', tone: 'orange' },
    { name: 'Daniel Okafor', role: 'Controller, Northwind', quote: 'I got a real lunch break back. That alone sold me.', tone: 'green' },
    { name: 'Megan Liu', role: 'Head of Finance, Verra', quote: 'It feels like the software finally caught up to my team.', tone: 'pink' },
  ]
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-head center reveal">
          <h2>Don’t just take our word for it.</h2>
        </div>
        <div className="t-grid reveal-stagger">
          {tiles.map((t, i) => (
            <article key={i} className={`t-card t-${t.tone}`}>
              <div className="t-photo">
                <div className="t-photo-bg" />
                <div className="t-play">▶</div>
              </div>
              <blockquote>“{t.quote}”</blockquote>
              <div className="t-meta">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ThreeWays() {
  return (
    <section className="section three-ways">
      <div className="container">
        <div className="section-head center reveal">
          <p className="eyebrow">Three</p>
          <h2>ways we save your company<br />both time and money.</h2>
        </div>
        <div className="tw-stack">
          <ThreeWayBlock
            n="01"
            title="Set policies that enforce themselves."
            body="Spend rules run before the swipe. Ramp blocks out‑of‑policy transactions in real time and routes the rest for instant approval."
            visual={<PolicyForm />}
            reverse={false}
          />
          <ThreeWayBlock
            n="02"
            title="Triple checks are done for you."
            body="Receipts, memos, GL codes, approvals — all collected and verified automatically before anything hits your books."
            visual={<Checklist />}
            reverse={true}
          />
          <ThreeWayBlock
            n="03"
            title="Leave the busywork to us. We love it."
            body="From categorizing transactions to syncing with your ERP, Ramp handles the boring parts so your team can focus on the work that matters."
            visual={<TodayCard />}
            reverse={false}
          />
        </div>
      </div>
    </section>
  )
}

function ThreeWayBlock({ n, title, body, visual, reverse }) {
  return (
    <div className={`tw-row reveal ${reverse ? 'tw-reverse' : ''}`}>
      <div className="tw-text">
        <span className="tw-num">{n}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <a href="#" className="feat-link">Learn more →</a>
      </div>
      <div className="tw-visual">{visual}</div>
    </div>
  )
}

function PolicyForm() {
  return (
    <div className="policy">
      <div className="policy-head">New spend policy</div>
      <div className="policy-row"><label>Category</label><div className="pf-input">Software</div></div>
      <div className="policy-row"><label>Limit per month</label><div className="pf-input">$2,500</div></div>
      <div className="policy-row"><label>Requires receipt over</label><div className="pf-input">$25</div></div>
      <div className="policy-row"><label>Approver</label><div className="pf-input">Finance team</div></div>
      <div className="policy-actions"><button className="btn btn-dark">Save policy</button></div>
    </div>
  )
}

function Checklist() {
  const items = [
    'Receipt attached',
    'Memo present',
    'GL code assigned',
    'Approver verified',
    'Synced to QuickBooks',
  ]
  return (
    <div className="checklist">
      <div className="cl-head">Auto‑checks</div>
      {items.map((t, i) => (
        <div className="cl-row" key={i}>
          <span className="cl-check">✓</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  )
}

function TodayCard() {
  const rows = [
    ['Sara Chen', 'Office supplies', '$84.10'],
    ['Marco Reyes', 'Client dinner', '$210.40'],
    ['Aisha Patel', 'Conference', '$1,295.00'],
  ]
  return (
    <div className="today">
      <div className="today-head"><strong>Today</strong><span>View all</span></div>
      {rows.map(([n, c, a], i) => (
        <div className="today-row" key={i}>
          <div className="today-av" style={{ background: ['#d8ff3d','#ff7a3c','#b9d4ff'][i] }}>
            {n.split(' ').map(p => p[0]).join('')}
          </div>
          <div className="today-info"><strong>{n}</strong><span>{c}</span></div>
          <div className="today-amt">{a}</div>
        </div>
      ))}
    </div>
  )
}

export function CustomerGrid() {
  const cells = [
    { tag: 'Startups', logo: 'NORTH' },
    { tag: 'SMB', logo: 'STUDIO' },
    { tag: 'Mid‑market', logo: 'VERRA' },
    { tag: 'Enterprise', logo: 'NIMBUS' },
    { tag: 'Tech', logo: 'PIXEL' },
    { tag: 'Retail', logo: 'HARBOR' },
    { tag: 'Healthcare', logo: 'CLINIQ' },
    { tag: 'Nonprofit', logo: 'GIVE+' },
  ]
  return (
    <section className="section cust-grid">
      <div className="container">
        <div className="section-head center reveal">
          <h2>For startups, global enterprises,<br />and everyone in between.</h2>
        </div>
        <div className="cg-grid reveal-stagger">
          {cells.map((c, i) => (
            <div className="cg-cell" key={i}>
              <div className="cg-logo">{c.logo}</div>
              <div className="cg-tag">{c.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function MoreTime() {
  const cards = [
    {
      quote: 'We saved 200+ hours a month and finally retired our spreadsheet of doom.',
      name: 'Jordan Wells',
      role: 'VP Finance, STUDIO',
      tone: 'cream',
    },
    {
      quote: 'Ramp paid for itself in the first quarter — the cashback alone covered our seats.',
      name: 'Iris Tanaka',
      role: 'Controller, Nimbus',
      tone: 'lime',
    },
    {
      quote: 'My team actually closes the month before the month ends.',
      name: 'Hugo Martín',
      role: 'CFO, Harbor & Co.',
      tone: 'dark',
    },
  ]
  return (
    <section className="section more-time">
      <div className="container">
        <div className="section-head center reveal">
          <h2>What would you do with more time?</h2>
        </div>
        <div className="mt-grid reveal-stagger">
          {cards.map((c, i) => (
            <article key={i} className={`mt-card mt-${c.tone}`}>
              <blockquote>“{c.quote}”</blockquote>
              <div className="mt-meta">
                <div className="mt-av" />
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ForbesCallout() {
  return (
    <section className="section forbes">
      <div className="container forbes-inner reveal">
        <div className="forbes-badge">
          <div className="fb-top">FORBES</div>
          <div className="fb-mid">CLOUD</div>
          <div className="fb-num">100</div>
          <div className="fb-yr">2024</div>
        </div>
        <div className="forbes-story">
          <p className="eyebrow">Customer story</p>
          <h3>How Verra closed the month in 3 days, not 3 weeks.</h3>
          <p>
            By moving cards, bills, and reimbursements onto Ramp, Verra cut
            their close cycle by 78% and reinvested the time into strategic
            forecasting.
          </p>
          <a href="#" className="feat-link dark">Read the story →</a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const cols = [
    { title: 'Product', items: ['Corporate Cards', 'Bill Pay', 'Expense Management', 'Travel', 'Accounting', 'Procurement'] },
    { title: 'Company', items: ['About', 'Careers', 'Press', 'Partners', 'Newsroom'] },
    { title: 'Resources', items: ['Blog', 'Customer stories', 'Help center', 'Guides', 'API docs'] },
    { title: 'Legal', items: ['Privacy', 'Terms', 'Security', 'Cookie settings'] },
    { title: 'Contact', items: ['Sales', 'Support', 'Press inquiries', 'hello@ramp.example'] },
  ]
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-cta reveal">
          <div>
            <h2>Time is money. Save both.</h2>
            <p>Join 30,000+ companies running smarter on Ramp.</p>
          </div>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Work email" />
            <button className="btn btn-lime">Get started</button>
          </form>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo logo-light">ramp</div>
            <p className="brand-tag">The all‑in‑one finance platform for growing businesses.</p>
            <div className="socials">
              <span>𝕏</span><span>in</span><span>▶</span><span>◆</span>
            </div>
          </div>
          {cols.map(col => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              <ul>{col.items.map(i => <li key={i}><a href="#">{i}</a></li>)}</ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 Ramp Business Corporation. All rights reserved.</span>
          <span>Made with care · Not a real product</span>
        </div>
      </div>
    </footer>
  )
}
