import { useEffect } from 'react'
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

function useGlobalReveal() {
  useEffect(() => {
    // Mark JS as active so hidden pre-state CSS (gated on .js-motion) takes effect.
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
  }, [])
}

export default function App() {
  useGlobalReveal()
  return (
    <div className="page">
      <Nav />
      <Hero />
      <LogosStrip />
      <LunchBreak />
      <Testimonials />
      <ThreeWays />
      <CustomerGrid />
      <MoreTime />
      <ForbesCallout />
      <Footer />
    </div>
  )
}
