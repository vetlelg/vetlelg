import { useEffect, useRef } from 'react'
import './DepthIndicator.css'

const MAX_DEPTH = 11000

export default function DepthIndicator() {
  const valueRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      const depth = Math.round(progress * MAX_DEPTH)

      if (valueRef.current) {
        valueRef.current.textContent = `${depth.toLocaleString()}m`
      }
      if (markerRef.current) {
        markerRef.current.style.top = `${progress * 100}%`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="depth-indicator" aria-hidden="true">
      <div className="depth-indicator__track">
        <div ref={markerRef} className="depth-indicator__marker" />
      </div>
      <span ref={valueRef} className="depth-indicator__value">0m</span>
    </div>
  )
}
