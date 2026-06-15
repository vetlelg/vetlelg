import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const HeroCaustics = lazy(() => import('./HeroCaustics'))
import './HeroSection.css'

export default function HeroSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.from('.hero__name', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
      })
      gsap.from('.hero__subtitle', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      })
      gsap.from('.hero__scroll-indicator', {
        opacity: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power2.out',
      })

      gsap.to('.hero__scroll-indicator', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '25% top',
          scrub: true,
        },
        opacity: 0,
        y: -10,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="zone-section hero">
      <Suspense fallback={null}>
        <HeroCaustics />
      </Suspense>
      <div className="hero__content">
        <span className="zone-label">0m — Surface Zone</span>
        <h1 className="hero__name">Vetle Larsen Gundersen</h1>
        <p className="hero__subtitle">Software Developer</p>
      </div>
      <div className="hero__scroll-indicator">
        <span className="hero__scroll-text">Scroll to descend</span>
        <svg className="hero__scroll-chevrons" width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
          <path d="M4 2L10 8L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          <path d="M4 8L10 14L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>
      </div>
    </section>
  )
}
