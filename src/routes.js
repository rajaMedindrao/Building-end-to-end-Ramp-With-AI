// Single source of truth for nav + footer routes.
// Each entry: { label, path, eyebrow, title, intro, sections }

export const slug = (s) =>
  s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const NAV_LINKS = [
  ['Product', '/product'],
  ['Customers', '/customers'],
  ['Pricing', '/pricing'],
  ['Resources', '/resources'],
  ['Company', '/company'],
]

export const FOOTER_COLS = [
  {
    title: 'Product',
    items: [
      ['Corporate Cards', '/product/corporate-cards'],
      ['Bill Pay', '/product/bill-pay'],
      ['Expense Management', '/product/expense-management'],
      ['Travel', '/product/travel'],
      ['Accounting', '/product/accounting'],
      ['Procurement', '/product/procurement'],
    ],
  },
  {
    title: 'Company',
    items: [
      ['About', '/company/about'],
      ['Careers', '/company/careers'],
      ['Press', '/company/press'],
      ['Partners', '/company/partners'],
      ['Newsroom', '/company/newsroom'],
    ],
  },
  {
    title: 'Resources',
    items: [
      ['Blog', '/resources/blog'],
      ['Customer stories', '/resources/customer-stories'],
      ['Help center', '/resources/help-center'],
      ['Guides', '/resources/guides'],
      ['API docs', '/resources/api-docs'],
    ],
  },
  {
    title: 'Legal',
    items: [
      ['Privacy', '/legal/privacy'],
      ['Terms', '/legal/terms'],
      ['Security', '/legal/security'],
      ['Cookie settings', '/legal/cookie-settings'],
    ],
  },
  {
    title: 'Contact',
    items: [
      ['Sales', '/contact/sales'],
      ['Support', '/contact/support'],
      ['Press inquiries', '/contact/press-inquiries'],
      ['hello@ramp.example', '/contact/email'],
    ],
  },
]

// Top-level page content (Product, Customers, Pricing, Resources, Company,
// plus Sign in / Get started). Sub-pages from the footer fall through to a
// generic stub page generated from the URL path.
export const TOP_PAGES = {
  '/product': {
    eyebrow: 'Product',
    title: 'One finance platform. Every workflow.',
    intro:
      'Cards, bills, expenses, travel, procurement, and accounting — all on a single platform that automates the busywork.',
    cards: [
      ['Corporate Cards', 'Issue physical and virtual cards with controls baked in.'],
      ['Bill Pay', 'Capture, code, approve, and pay every bill from one inbox.'],
      ['Expense Management', 'Receipts collected, categorized, and submitted automatically.'],
      ['Travel', 'Book trips with policy enforcement and live spend visibility.'],
      ['Accounting', 'Real‑time sync with QuickBooks, NetSuite, Xero, and more.'],
      ['Procurement', 'Request, approve, and track every dollar before it leaves.'],
    ],
  },
  '/customers': {
    eyebrow: 'Customers',
    title: 'Loved by 30,000+ teams.',
    intro:
      'From early‑stage startups to global enterprises, finance leaders pick Ramp to close their books faster and put time back into strategy.',
    cards: [
      ['STUDIO', 'Saved 200+ hours every month.'],
      ['Verra', 'Closed the month in 3 days, not 3 weeks.'],
      ['Harbor & Co.', 'Reduced expense errors by 92%.'],
      ['Nimbus', 'Earned $480k in cashback in year one.'],
      ['Glow Labs', 'Closed books 8 days faster, every cycle.'],
      ['Northwind', 'Replaced 6 tools with a single platform.'],
    ],
  },
  '/pricing': {
    eyebrow: 'Pricing',
    title: 'Simple, transparent pricing.',
    intro:
      'Ramp is free for everyone. Upgrade only when your team needs advanced controls, multi‑entity, or premium support.',
    plans: [
      {
        name: 'Ramp',
        price: 'Free',
        line: 'Forever, for every business.',
        features: [
          'Unlimited corporate cards',
          'Bill Pay & expense management',
          'Real‑time accounting sync',
          'Up to 1.5% cashback on every swipe',
        ],
      },
      {
        name: 'Ramp Plus',
        price: '$15 / user / mo',
        line: 'For finance teams that need more.',
        features: [
          'Everything in Ramp',
          'Custom approval workflows',
          'Multi‑entity & multi‑currency',
          'Priority support',
        ],
        highlight: true,
      },
      {
        name: 'Ramp Enterprise',
        price: 'Talk to us',
        line: 'For complex global organizations.',
        features: [
          'Everything in Ramp Plus',
          'Custom integrations & SSO',
          'Dedicated account team',
          'Custom SLA & security review',
        ],
      },
    ],
  },
  '/resources': {
    eyebrow: 'Resources',
    title: 'Learn finance, faster.',
    intro:
      'Guides, customer stories, and product deep‑dives to help your team get the most out of Ramp — and the most out of every dollar.',
    cards: [
      ['Blog', 'Trends, tips, and product news from the Ramp team.'],
      ['Customer stories', 'How real finance teams use Ramp every day.'],
      ['Help center', 'Step‑by‑step product documentation.'],
      ['Guides', 'In‑depth playbooks on closing the books, controls, and more.'],
      ['API docs', 'Build with Ramp using our REST and webhook APIs.'],
      ['Webinars', 'Live and on‑demand sessions with finance leaders.'],
    ],
  },
  '/company': {
    eyebrow: 'Company',
    title: 'Building the future of finance.',
    intro:
      'We’re a team of finance leaders, designers, and engineers building the all‑in‑one platform we always wished we had.',
    cards: [
      ['About', 'Our mission, values, and the team behind Ramp.'],
      ['Careers', 'We’re hiring across product, engineering, and finance.'],
      ['Press', 'News, brand assets, and media inquiries.'],
      ['Partners', 'Accountants, agencies, and integrations partners.'],
      ['Newsroom', 'Product launches and company milestones.'],
    ],
  },
  '/sign-in': {
    eyebrow: 'Welcome back',
    title: 'Sign in to Ramp.',
    intro: 'Use your work email to sign in to your Ramp account.',
    form: 'sign-in',
  },
  '/get-started': {
    eyebrow: 'Get started',
    title: 'Try Ramp free.',
    intro:
      'No credit card required. Get set up in minutes and start saving on the next swipe.',
    form: 'sign-up',
  },
}
