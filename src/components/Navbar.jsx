import { useState, useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import './Navbar.css'

const navLinks = [
  { id: 'hero', label: 'Surface' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const navRef = useRef(null)
  const lastScrollY = useRef(0)
  const lenis = useLenis()

  useEffect(() => {
    const sectionEls = navLinks.map((l) => ({
      id: l.id,
      el: document.getElementById(l.id),
    }))

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      setScrolled(currentY > 50)

      if (currentY > 200 && delta > 8) {
        setHidden(true)
        setMenuOpen(false)
      } else if (delta < -4 || currentY <= 50) {
        setHidden(false)
      }

      const threshold = window.innerHeight * 0.35
      let current = sectionEls[0].id
      for (const s of sectionEls) {
        if (s.el && s.el.getBoundingClientRect().top <= threshold) {
          current = s.id
        }
      }
      setActiveSection(current)

      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.body.style.overflow = ''
    }
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [menuOpen, lenis])

  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)

      if (e.key === 'Tab' && navRef.current) {
        const focusable = navRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavClick = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      lenis?.scrollTo(el)
    }
    setMenuOpen(false)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setMenuOpen(false)
  }

  let className = 'navbar'
  if (scrolled) className += ' navbar--scrolled'
  if (hidden) className += ' navbar--hidden'

  return (
    <nav
      ref={navRef}
      className={className}
      aria-label="Main navigation"
    >
      <a
        href="#hero"
        className="navbar__logo"
        onClick={(e) => handleNavClick(e, 'hero')}
      >
        VLG
      </a>

      <button
        className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
      >
        <span />
        <span />
        <span />
      </button>

      <ul
        id="nav-menu"
        className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}
        role="list"
        onClick={handleOverlayClick}
      >
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={activeSection === link.id ? 'navbar__link--active' : ''}
              data-section={link.id}
              aria-current={activeSection === link.id ? 'true' : undefined}
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
