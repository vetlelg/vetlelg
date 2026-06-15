import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function DepthFog() {
  const fogRef = useRef(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced || !fogRef.current) return

    const el = fogRef.current

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        const fogStart = 0.15
        const strength = Math.max(0, (p - fogStart) / (1 - fogStart))
        const eased = strength * strength

        const clearRadius = 90 - eased * 50
        const edgeOpacity = eased * 0.35

        el.style.background = `radial-gradient(ellipse at 50% 50%, transparent ${clearRadius}%, rgba(0, 0, 0, ${edgeOpacity}) 100%)`
      },
    })

    return () => trigger.kill()
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <div
      ref={fogRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}
