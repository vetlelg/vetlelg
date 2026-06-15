import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import DepthIndicator from './components/DepthIndicator'
import HeroSection from './components/HeroSection'
import ExperienceSection from './components/ExperienceSection'
import EducationSection from './components/EducationSection'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const zones = [
  { id: 'hero', label: '0m — Surface Zone', title: 'Hero', accent: '--accent-surface' },
  { id: 'experience', label: '200m — Sunlight Zone', title: 'Experience', accent: '--accent-sunlight' },
  { id: 'education', label: '1,000m — Twilight Zone', title: 'Education', accent: '--accent-twilight' },
  { id: 'projects', label: '4,000m — Midnight Zone', title: 'Projects', accent: '--accent-midnight' },
  { id: 'contact', label: '6,000m — Abyssal Zone', title: 'Contact', accent: '--accent-abyss' },
]

const bgColors = [
  '#0077B6',
  '#023E8A',
  '#03045E',
  '#0A0A2A',
  '#050510',
  '#000000',
]

function App() {
  const containerRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const sections = containerRef.current.querySelectorAll('.zone-section')
    const triggers = []

    sections.forEach((section, i) => {
      if (i >= bgColors.length - 1) return

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const from = bgColors[i]
          const to = bgColors[i + 1]
          const color = interpolateColor(from, to, self.progress)
          document.body.style.backgroundColor = color
        },
      })
      triggers.push(trigger)
    })

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <div ref={containerRef}>
      <Navbar />
      <DepthIndicator />
      {zones.map((zone) => {
        if (zone.id === 'hero') return <HeroSection key={zone.id} />
        if (zone.id === 'experience') return <ExperienceSection key={zone.id} />
        if (zone.id === 'education') return <EducationSection key={zone.id} />
        return (
          <section key={zone.id} id={zone.id} className="zone-section">
            <span className="zone-label">{zone.label}</span>
            <h2 className="zone-title" style={{ color: `var(${zone.accent})` }}>
              {zone.title}
            </h2>
            <p className="zone-subtitle">Content coming soon</p>
          </section>
        )
      })}
    </div>
  )
}

function interpolateColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

export default App
