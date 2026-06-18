import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import education from '../data/education'

const TwilightParticles = lazy(() => import('./TwilightParticles'))
import './EducationSection.css'

export default function EducationSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      SplitText.create('.zone-title--twilight', {
        type: 'chars',
        aria: 'auto',
        onSplit(self) {
          return gsap.from(self.chars, {
            scrollTrigger: {
              trigger: '.education__content',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            y: 20,
            opacity: 0,
            stagger: 0.03,
            duration: 0.5,
            ease: 'power2.out',
          })
        },
      })
      gsap.from('.education__card', {
        scrollTrigger: {
          trigger: '.education__grid',
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.25,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="education" className="zone-section education">
      <Suspense fallback={null}>
        <TwilightParticles />
      </Suspense>
      <div className="education__content">
        <span className="zone-label">1,000m — Twilight Zone</span>
        <h2 className="zone-title zone-title--twilight">
          Education
        </h2>
        <div className="education__grid">
          {education.map((entry) => (
            <div key={entry.id} className="education__card">
              <div className="education__year">{entry.year}</div>
              <h3 className="education__degree">{entry.degree}</h3>
              <div className="education__institution">{entry.institution}</div>
              <ul className="education__highlights">
                {entry.highlights.map((item, i) => (
                  <li key={i} className="education__highlight">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
