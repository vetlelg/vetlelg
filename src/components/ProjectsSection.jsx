import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import projects from '../data/projects'
import MidnightParticles from './MidnightParticles'
import './ProjectsSection.css'

export default function ProjectsSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.from('.projects__card', {
        scrollTrigger: {
          trigger: '.projects__grid',
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="projects" className="zone-section projects">
      <MidnightParticles />
      <div className="projects__content">
        <span className="zone-label">4,000m — Midnight Zone</span>
        <h2 className="zone-title" style={{ color: 'var(--accent-midnight)' }}>
          Projects
        </h2>
        <div className="projects__grid">
          {projects.map((project, index) => (
            <div key={project.id} className="projects__card">
              <div className="projects__card-header">
                <span className="projects__specimen-id">
                  SPECIMEN-{String(index + 1).padStart(3, '0')}
                </span>
                <span className="projects__status">CATALOGUED</span>
              </div>
              <h3 className="projects__title">{project.title}</h3>
              <p className="projects__description">{project.description}</p>
              <div className="projects__tech">
                {project.technologies.map((tech) => (
                  <span key={tech} className="projects__tech-tag">{tech}</span>
                ))}
              </div>
              <div className="projects__links">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="projects__link"
                >
                  Live Demo
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="projects__link projects__link--github"
                >
                  Source
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
