import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import experience from '../data/experience'

const SunlightParticles = lazy(() => import('./SunlightParticles'))
import './ExperienceSection.css'

export default function ExperienceSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.from('.experience__card', {
        scrollTrigger: {
          trigger: '.experience__timeline',
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="experience" className="zone-section experience">
      <Suspense fallback={null}>
        <SunlightParticles />
      </Suspense>
      <div className="experience__content">
        <span className="zone-label">200m — Sunlight Zone</span>
        <h2 className="zone-title zone-title--sunlight">
          Experience
        </h2>
        <div className="experience__timeline">
          {experience.map((job) => (
            <div key={job.id} className="experience__card">
              <div className="experience__card-header">
                <h3 className="experience__role">{job.role}</h3>
                <span className="experience__dates">
                  {job.startDate} — {job.endDate}
                </span>
              </div>
              <div className="experience__company">{job.company}</div>
              <p className="experience__description">{job.description}</p>
              <div className="experience__tech">
                {job.technologies.map((tech) => (
                  <span key={tech} className="experience__tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
