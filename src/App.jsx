import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import './App.css'
import {
  Nav,
  Hero,
  LogosStrip,
  LunchBreak,
  Testimonials,
  ThreeWays,
  CustomerGrid,
  MoreTime,
  ForbesCallout,
  Footer,
} from './components/sections.jsx'
import StubPage from './components/StubPage.jsx'
import { getPageMeta } from './routes.js'

function setMetaTag(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/^meta\[(name|property)="([^"]+)"\]$/) || []
    if (key && name) el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function usePageMeta(pathname) {
  useEffect(() => {
    const { title, description, image } = getPageMeta(pathname)
    document.title = title
    const origin = window.location.origin
    const url = origin + pathname
    const imageUrl = image ? origin + image : undefined
    setMetaTag('meta[name="description"]', 'content', description)
    setMetaTag('meta[property="og:title"]', 'content', title)
    setMetaTag('meta[property="og:description"]', 'content', description)
    setMetaTag('meta[property="og:url"]', 'content', url)
    setMetaTag('meta[property="og:type"]', 'content', 'website')
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', 'content', title)
    setMetaTag('meta[name="twitter:description"]', 'content', description)
    if (imageUrl) {
      setMetaTag('meta[property="og:image"]', 'content', imageUrl)
      setMetaTag('meta[property="og:image:width"]', 'content', '1200')
      setMetaTag('meta[property="og:image:height"]', 'content', '630')
      setMetaTag('meta[property="og:image:alt"]', 'content', title)
      setMetaTag('meta[name="twitter:image"]', 'content', imageUrl)
      setMetaTag('meta[name="twitter:image:alt"]', 'content', title)
    }
  }, [pathname])
}

function useGlobalReveal(deps) {
  useEffect(() => {
    document.documentElement.classList.add('js-motion')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = document.querySelectorAll('.reveal, .reveal-stagger')
    if (reduce) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, deps)
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

function HomePage() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <LunchBreak />
      <Testimonials />
      <ThreeWays />
      <CustomerGrid />
      <MoreTime />
      <ForbesCallout />
    </>
  )
}

function Layout() {
  const { pathname } = useLocation()
  useGlobalReveal([pathname])
  usePageMeta(pathname)
  return (
    <div className="page">
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<StubPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
    </BrowserRouter>
  )
}
