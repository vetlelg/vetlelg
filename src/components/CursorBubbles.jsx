import { useEffect, useRef } from 'react'

const MAX_BUBBLES = 60
const SPAWN_DISTANCE = 12

const ACCENT_COLORS = [
  [202, 240, 248],
  [144, 224, 239],
  [123, 47, 190],
  [0, 245, 212],
  [247, 37, 133],
]

const CAN_HOVER =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

export default function CursorBubbles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)
    let bubbles = []
    let lastX = 0
    let lastY = 0
    let distAccum = 0
    let animId = 0
    let animating = false
    let resizeTimer = 0
    let currentColor = ACCENT_COLORS[0]
    const sections = document.querySelectorAll('.zone-section')

    function updateColor() {
      const sy = window.scrollY
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].offsetTop
        const height = sections[i].offsetHeight
        if (sy < top + height || i === sections.length - 1) {
          const progress = Math.min(1, Math.max(0, (sy - top) / height))
          const from = ACCENT_COLORS[Math.min(i, ACCENT_COLORS.length - 1)]
          const to = ACCENT_COLORS[Math.min(i + 1, ACCENT_COLORS.length - 1)]
          currentColor = [
            Math.round(from[0] + (to[0] - from[0]) * progress),
            Math.round(from[1] + (to[1] - from[1]) * progress),
            Math.round(from[2] + (to[2] - from[2]) * progress),
          ]
          break
        }
      }
    }

    function applyResize() {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    applyResize()

    function resize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(applyResize, 200)
    }
    window.addEventListener('resize', resize)

    function onMove(e) {
      const x = e.clientX
      const y = e.clientY
      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.sqrt(dx * dx + dy * dy)
      distAccum += dist

      const speed = Math.min(dist, 40)
      const count = Math.floor(distAccum / SPAWN_DISTANCE)

      if (count > 0 && bubbles.length < MAX_BUBBLES) {
        distAccum = distAccum % SPAWN_DISTANCE
        const toSpawn = Math.min(count, 3)
        const wasEmpty = bubbles.length === 0

        for (let i = 0; i < toSpawn && bubbles.length < MAX_BUBBLES; i++) {
          const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.6
          const spawnDist = Math.random() * 6
          bubbles.push({
            x: x + Math.cos(angle) * spawnDist,
            y: y + Math.sin(angle) * spawnDist,
            color: currentColor,
            r: Math.random() * 2.2 + 1.2,
            vx: (Math.random() - 0.5) * 0.3 + Math.cos(angle) * speed * 0.02,
            vy: -(Math.random() * 0.5 + 0.25),
            opacity: Math.random() * 0.2 + 0.25,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleAmp: Math.random() * 0.3 + 0.1,
            life: 0,
            maxLife: Math.random() * 80 + 50,
          })
        }

        if (wasEmpty && !animating) {
          animating = true
          animId = requestAnimationFrame(animate)
        }
      }

      lastX = x
      lastY = y
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        b.life++
        const progress = b.life / b.maxLife

        b.x += b.vx + Math.sin(b.life * 0.08 + b.wobblePhase) * b.wobbleAmp
        b.y += b.vy
        b.vy -= 0.002

        const fade = progress < 0.15
          ? progress / 0.15
          : 1 - (progress - 0.15) / 0.85
        const alpha = b.opacity * Math.max(0, fade)
        const radius = b.r * (1 - progress * 0.3)

        if (progress >= 1 || alpha < 0.01) {
          bubbles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(b.x, b.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, ${alpha})`
        ctx.fill()

        if (radius > 1.5) {
          ctx.beginPath()
          ctx.arc(b.x - radius * 0.3, b.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
          const hr = Math.min(255, b.color[0] + 40)
          const hg = Math.min(255, b.color[1] + 40)
          const hb = Math.min(255, b.color[2] + 40)
          ctx.fillStyle = `rgba(${hr}, ${hg}, ${hb}, ${alpha * 0.5})`
          ctx.fill()
        }
      }

      if (bubbles.length === 0) {
        animating = false
        return
      }
      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', updateColor, { passive: true })
    updateColor()

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateColor)
      cancelAnimationFrame(animId)
      clearTimeout(resizeTimer)
    }
  }, [])

  if (!CAN_HOVER) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        width: '100%',
        height: '100%',
      }}
    />
  )
}
