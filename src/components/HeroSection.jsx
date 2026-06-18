import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const HeroCaustics = lazy(() => import('./HeroCaustics'))
import './HeroSection.css'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.from('.hero__coordinates', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
      gsap.from('.hero__portrait', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        delay: 0.15,
        ease: 'power2.out',
      })
      gsap.from('.hero__name', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      })
      gsap.from('.hero__subtitle', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.45,
        ease: 'power2.out',
      })
      gsap.from('.hero__divider', {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: 'power2.out',
      })
      gsap.from('.hero__about', {
        y: 15,
        opacity: 0,
        duration: 0.8,
        delay: 0.7,
        ease: 'power2.out',
      })
      gsap.from('.hero__scroll-indicator', {
        opacity: 0,
        duration: 1,
        delay: 1,
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
        <div className="hero__coordinates" aria-hidden="true">
          <span className="hero__coord">59.9°N</span>
          <span className="hero__coord-sep" />
          <span className="hero__coord">10.7°E</span>
          <span className="hero__coord-sep" />
          <span className="hero__coord">DEPTH 0m</span>
        </div>
        <div className="hero__portrait">
          <div className="hero__portrait-ring" />
          {imgFailed ? (
            <div className="hero__portrait-fallback" aria-hidden="true">V</div>
          ) : (
            <img
              className="hero__portrait-img"
              src="/profile.jpg"
              alt="Vetle Larsen Gundersen"
              loading="eager"
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <h1 className="hero__name">Vetle Larsen Gundersen</h1>
        <p className="hero__subtitle">Software Developer</p>
        <div className="hero__divider" aria-hidden="true" />
        <p className="hero__about">
          Consultant and master&apos;s student based in Oslo, building event-driven
          systems and reactive backends. Background in IT operations with
          international experience from Singapore and New Zealand.
        </p>
        <div className="hero__scroll-indicator">
          <span className="hero__scroll-text">Scroll to descend</span>
          <svg className="hero__scroll-chevrons" width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M4 2L10 8L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            <path d="M4 8L10 14L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
          </svg>
        </div>
      </div>
    </section>
  )
}
