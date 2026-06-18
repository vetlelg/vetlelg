import { useEffect, useRef } from 'react'
import './DepthIndicator.css'

const MAX_DEPTH = 11000

const ZONE_ACCENTS = [
  [202, 240, 248], // --accent-surface  #CAF0F8
  [144, 224, 239], // --accent-sunlight #90E0EF
  [123, 47, 190],  // --accent-twilight #7B2FBE
  [0, 245, 212],   // --accent-midnight #00F5D4
  [247, 37, 133],  // --accent-abyss    #F72585
]

function getZoneColor(progress) {
  const t = progress * (ZONE_ACCENTS.length - 1)
  const i = Math.min(Math.floor(t), ZONE_ACCENTS.length - 2)
  const f = t - i
  const from = ZONE_ACCENTS[i]
  const to = ZONE_ACCENTS[i + 1]
  const r = Math.round(from[0] + (to[0] - from[0]) * f)
  const g = Math.round(from[1] + (to[1] - from[1]) * f)
  const b = Math.round(from[2] + (to[2] - from[2]) * f)
  return `rgb(${r},${g},${b})`
}

export default function DepthIndicator() {
  const valueRef = useRef(null)
  const markerRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      const depth = Math.round(progress * MAX_DEPTH)
      const color = getZoneColor(progress)

      if (valueRef.current) {
        valueRef.current.textContent = `${depth.toLocaleString()}m`
        valueRef.current.style.color = color
      }
      if (markerRef.current) {
        markerRef.current.style.top = `${progress * 100}%`
        markerRef.current.style.background = color
        markerRef.current.style.boxShadow = `0 0 8px ${color}`
      }
      if (trackRef.current) {
        trackRef.current.style.background = `linear-gradient(to bottom, ${getZoneColor(0)}, ${getZoneColor(0.25)}, ${getZoneColor(0.5)}, ${getZoneColor(0.75)}, ${getZoneColor(1)})`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="depth-indicator" aria-hidden="true">
      <div ref={trackRef} className="depth-indicator__track">
        <div ref={markerRef} className="depth-indicator__marker" />
      </div>
      <span ref={valueRef} className="depth-indicator__value">0m</span>
    </div>
  )
}
