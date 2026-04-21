// Single source of truth for nav + footer routes.
// Each entry: { label, path, eyebrow, title, intro, sections }

export const SITE_NAME = 'Ramp'
export const SITE_TAGLINE = 'Time is money. Save both.'
export const DEFAULT_DESCRIPTION =
  'Ramp is the all‑in‑one finance platform for corporate cards, bill pay, expenses, travel, accounting, and procurement — built to save your team time and money.'

export const DEFAULT_OG_IMAGE = '/og-default.png'

// Section -> branded social preview image. Anything not listed here falls
// back to DEFAULT_OG_IMAGE.
const SECTION_IMAGES = {
  '/': '/og-default.png',
  '/product': '/og-product.png',
  '/pricing': '/og-pricing.png',
  '/company': '/og-company.png',
  '/resources': '/og-resources.png',
}

export const HOME_META = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    'Ramp combines corporate cards, bill pay, expenses, travel, accounting, and procurement on one platform that saves your team time and money.',
  image: SECTION_IMAGES['/'],
}

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
    comparison: {
      columns: ['Ramp', 'Ramp Plus', 'Ramp Enterprise'],
      groups: [
        {
          title: 'Cards & spend',
          rows: [
            ['Unlimited corporate cards', true, true, true],
            ['Cashback on every swipe', 'Up to 1.5%', 'Up to 1.5%', 'Custom'],
            ['Custom spend controls', 'Basic', 'Advanced', 'Advanced'],
            ['Vendor & category limits', false, true, true],
          ],
        },
        {
          title: 'Bills, expenses & travel',
          rows: [
            ['Bill Pay & expense management', true, true, true],
            ['Custom approval workflows', false, true, true],
            ['Travel booking & policies', 'Standard', 'Standard', 'Premium'],
            ['Procurement & intake', false, true, true],
          ],
        },
        {
          title: 'Accounting & controls',
          rows: [
            ['QuickBooks, NetSuite, Xero sync', true, true, true],
            ['Multi‑entity & multi‑currency', false, true, true],
            ['Custom integrations & SSO', false, false, true],
            ['Audit trail & SOC 2 reports', true, true, true],
          ],
        },
        {
          title: 'Support',
          rows: [
            ['Email & chat support', true, true, true],
            ['Priority support', false, true, true],
            ['Dedicated account team', false, false, true],
            ['Custom SLA', false, false, true],
          ],
        },
      ],
    },
    faqs: [
      {
        q: 'Is Ramp really free?',
        a: 'Yes. The base Ramp plan is free forever — no per‑user fees, no setup costs, no card fees. We make money on interchange when your team swipes the card, and you keep up to 1.5% cashback on every transaction.',
      },
      {
        q: 'How does the cashback work?',
        a: 'You earn cashback automatically on eligible card spend, paid as a statement credit each month. Effective rates depend on plan and merchant category, but most customers see between 1% and 1.5% back on the bulk of their spend.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No foreign transaction fees, no card replacement fees, no annual fees. Ramp Plus is a flat per‑user monthly price and Enterprise is a custom contract — both are quoted upfront with everything included.',
      },
      {
        q: 'Do I have to sign a long contract?',
        a: 'No. Ramp Plus is billed month‑to‑month and you can downgrade or cancel any time from your admin settings. Enterprise contracts are typically annual but always negotiated transparently.',
      },
      {
        q: 'Can I cancel and keep my data?',
        a: 'Yes. You can export every card, transaction, receipt, and report at any time as CSV or PDF. If you cancel, your historical data stays accessible in read‑only mode for 12 months.',
      },
      {
        q: 'How long does setup take?',
        a: 'Most teams are issuing their first cards within 15 minutes. Connecting your accounting software, importing vendors, and inviting your team typically takes a single afternoon.',
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

// Short, search/social-friendly descriptions per top page. Falls back to the
// page intro if a path is missing here.
const TOP_PAGE_DESCRIPTIONS = {
  '/product':
    'Cards, bill pay, expenses, travel, accounting, and procurement — every finance workflow on one Ramp platform.',
  '/customers':
    '30,000+ finance teams, from startups to enterprises, use Ramp to close the books faster and reclaim hours each week.',
  '/pricing':
    'Ramp is free for every business. Upgrade to Ramp Plus or Enterprise when your finance team needs more controls and scale.',
  '/resources':
    'Guides, customer stories, product updates, and API docs to help your team get more out of Ramp and every dollar.',
  '/company':
    'Meet the team building the all‑in‑one finance platform — our mission, careers, press, and partners.',
  '/sign-in': 'Sign in to your Ramp account with your work email.',
  '/get-started':
    'Create a Ramp account in minutes — no credit card required — and start saving on the next swipe.',
}

// Short descriptions for footer sub-pages. Falls back to a sensible default
// generated from the page title and parent section.
const SUB_PAGE_DESCRIPTIONS = {
  '/product/corporate-cards':
    'Issue physical and virtual corporate cards with built‑in spend controls, real‑time visibility, and up to 1.5% cashback.',
  '/product/bill-pay':
    'Capture, code, approve, and pay every bill from one inbox — with automatic accounting sync.',
  '/product/expense-management':
    'Receipts collected, categorized, and submitted automatically so your team can stop chasing expense reports.',
  '/product/travel':
    'Book business travel with policy enforcement, live spend visibility, and zero out‑of‑pocket expenses.',
  '/product/accounting':
    'Real‑time, two‑way sync with QuickBooks, NetSuite, Xero, and Sage to close the books faster.',
  '/product/procurement':
    'Request, approve, and track every dollar before it leaves — purchase orders and intake all in one place.',
  '/company/about':
    'Learn about Ramp’s mission, values, and the team building the all‑in‑one finance platform.',
  '/company/careers':
    'Join Ramp. We’re hiring across product, engineering, design, and finance to build the future of finance.',
  '/company/press': 'Press releases, brand assets, and media inquiries for Ramp.',
  '/company/partners':
    'Accountants, agencies, and integration partners who help customers get more out of Ramp.',
  '/company/newsroom':
    'Product launches, milestones, and the latest news from the Ramp team.',
  '/resources/blog':
    'Trends, tips, and product news from the Ramp team for modern finance leaders.',
  '/resources/customer-stories':
    'See how real finance teams use Ramp to save time, close the books faster, and grow with confidence.',
  '/resources/help-center':
    'Step‑by‑step product documentation and answers to common questions about Ramp.',
  '/resources/guides':
    'In‑depth playbooks on closing the books, building controls, and running a modern finance team.',
  '/resources/api-docs':
    'Build with Ramp using our REST and webhook APIs — reference, examples, and guides for developers.',
  '/legal/privacy':
    'How Ramp collects, uses, and protects personal information across our products and services.',
  '/legal/terms':
    'The terms and conditions that govern your use of Ramp’s products and services.',
  '/legal/security':
    'How Ramp keeps your finance data safe — security practices, certifications, and trust resources.',
  '/legal/cookie-settings':
    'Manage cookie preferences for ramp.example and learn how Ramp uses cookies.',
  '/contact/sales':
    'Talk to Ramp sales about corporate cards, bill pay, and the all‑in‑one finance platform for your team.',
  '/contact/support':
    'Get help from Ramp support — reach our team for product questions and account assistance.',
  '/contact/press-inquiries':
    'Media and press inquiries for Ramp — get in touch with our communications team.',
  '/contact/email': 'Email Ramp at hello@ramp.example.',
}

function titleizeSlug(s) {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function findFooterLabel(path) {
  for (const col of FOOTER_COLS) {
    for (const [label, p] of col.items) {
      if (p === path) return { label, section: col.title }
    }
  }
  return null
}

// Resolve the social preview image for a given pathname. Top-level pages
// get their own branded image; footer sub-pages inherit their parent
// section's image (e.g. /product/bill-pay -> /og-product.png).
function getPageImage(pathname) {
  if (SECTION_IMAGES[pathname]) return SECTION_IMAGES[pathname]
  const root = '/' + (pathname.split('/').filter(Boolean)[0] || '')
  return SECTION_IMAGES[root] || DEFAULT_OG_IMAGE
}

export function getPageMeta(pathname) {
  const image = getPageImage(pathname)

  if (pathname === '/' || pathname === '') {
    return {
      title: HOME_META.title,
      description: HOME_META.description,
      image,
    }
  }

  const top = TOP_PAGES[pathname]
  if (top) {
    const description = TOP_PAGE_DESCRIPTIONS[pathname] || top.intro
    const cleanTitle = top.title.replace(/\.$/, '')
    return {
      title: `${cleanTitle} | ${SITE_NAME}`,
      description,
      image,
    }
  }

  const footer = findFooterLabel(pathname)
  if (footer) {
    const description =
      SUB_PAGE_DESCRIPTIONS[pathname] ||
      `${footer.label} — part of Ramp’s ${footer.section.toLowerCase()} resources.`
    return {
      title: `${footer.label} | ${SITE_NAME}`,
      description,
      image,
    }
  }

  // Unknown path: derive something reasonable from the URL itself.
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)
  const last = parts[parts.length - 1] || 'Page'
  const section = parts.length > 1 ? titleizeSlug(parts[0]) : null
  const label = titleizeSlug(last)
  return {
    title: `${label} | ${SITE_NAME}`,
    description: section
      ? `${label} — part of Ramp’s ${section.toLowerCase()} section.`
      : DEFAULT_DESCRIPTION,
    image,
  }
}
