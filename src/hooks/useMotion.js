import { useEffect, useRef } from 'react'

export function useParallax(strength = 0.08) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const offset = (window.innerHeight / 2 - center) * strength
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [strength])
  return ref
}
