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
      gsap.from('.hero__links', {
        y: 15,
        opacity: 0,
        duration: 0.9,
        delay: 0.5,
        ease: 'power2.out',
      })
      gsap.from('.hero__scroll-indicator', {
        opacity: 0,
        duration: 1,
        delay: 1.0,
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
        <div className="hero__links">
          <a
            href="https://github.com/vetlelg"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__link"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/vetlelg"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__link"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
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
