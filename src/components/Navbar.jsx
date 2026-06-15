import { useState, useEffect, useRef } from 'react'
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
  const navRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
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

      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const handleNavClick = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
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

      <ul id="nav-menu" className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`} role="list">
        {navLinks.map((link) => (
          <li key={link.id}>
            <a href={`#${link.id}`} onClick={(e) => handleNavClick(e, link.id)}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
