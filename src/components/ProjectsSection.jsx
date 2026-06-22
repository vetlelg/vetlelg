import { lazy, Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import projects from '../data/projects'

const MidnightParticles = lazy(() => import('./MidnightParticles'))
import './ProjectsSection.css'

const featuredProjects = projects.filter((p) => p.featured)
const archiveProjects = projects.filter((p) => !p.featured)

function ProjectCard({ project, index }) {
  return (
    <div className="projects__card">
      <div className="projects__card-header">
        <span className="projects__specimen-id">
          SPECIMEN-{String(index + 1).padStart(3, '0')}
        </span>
        <span className="projects__status">CATALOGUED</span>
      </div>
      <span className="projects__context">
        {project.year} — {project.organization}
      </span>
      <h3 className="projects__title">{project.title}</h3>
      <p className="projects__description">{project.description}</p>
      <div className="projects__tech">
        {project.technologies.map((tech) => (
          <span key={tech} className="projects__tech-tag">{tech}</span>
        ))}
      </div>
      {(project.liveUrl || project.githubUrl) && (
        <div className="projects__links">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="projects__link"
              aria-label={`Live demo of ${project.title}`}
            >
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="projects__link projects__link--github"
              aria-label={`Source code for ${project.title}`}
            >
              Source
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const archiveRef = useRef(null)
  const refreshTimerRef = useRef(null)
  const [showArchive, setShowArchive] = useState(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      SplitText.create('.zone-title--midnight', {
        type: 'chars',
        aria: 'auto',
        onSplit(self) {
          return gsap.from(self.chars, {
            scrollTrigger: {
              trigger: '.projects__content',
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
      gsap.from('.projects__grid--featured .projects__card', {
        scrollTrigger: {
          trigger: '.projects__grid--featured',
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

    return () => {
      ctx.revert()
      clearTimeout(refreshTimerRef.current)
    }
  }, [])

  const toggleArchive = useCallback(() => {
    setShowArchive((prev) => {
      const next = !prev
      if (next) {
        requestAnimationFrame(() => {
          const cards = archiveRef.current?.querySelectorAll('.projects__card')
          if (!cards?.length) return
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (prefersReduced) return
          gsap.fromTo(cards,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15, overwrite: true }
          )
        })
      }
      return next
    })
    clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => ScrollTrigger.refresh(), 550)
  }, [])

  return (
    <section ref={sectionRef} id="projects" className="zone-section projects">
      <Suspense fallback={null}>
        <MidnightParticles />
      </Suspense>
      <div className="projects__content">
        <span className="zone-label">4,000m — Midnight Zone</span>
        <h2 className="zone-title zone-title--midnight">
          Projects
        </h2>
        <div className="projects__grid projects__grid--featured">
          {featuredProjects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
            />
          ))}
        </div>

        <button
          className="projects__archive-toggle"
          onClick={toggleArchive}
          aria-expanded={showArchive}
        >
          <span className="projects__archive-toggle-text">
            {showArchive ? 'COLLAPSE ARCHIVE' : `VIEW ARCHIVE — ${archiveProjects.length} MORE SPECIMENS`}
          </span>
          <span className={`projects__archive-toggle-arrow ${showArchive ? 'projects__archive-toggle-arrow--open' : ''}`}>
            &#9660;
          </span>
        </button>

        <div
          className={`projects__archive-wrapper ${showArchive ? 'projects__archive-wrapper--open' : ''}`}
          aria-hidden={!showArchive}
        >
          <div className="projects__archive-inner">
            <div ref={archiveRef} className="projects__grid projects__grid--archive">
              {archiveProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={featuredProjects.length + i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
