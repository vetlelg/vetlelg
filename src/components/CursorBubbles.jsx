import { useEffect, useRef } from 'react'

const MAX_BUBBLES = 60
const SPAWN_DISTANCE = 12

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

    function resize() {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
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

        for (let i = 0; i < toSpawn; i++) {
          const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.6
          const spawnDist = Math.random() * 6
          bubbles.push({
            x: x + Math.cos(angle) * spawnDist,
            y: y + Math.sin(angle) * spawnDist,
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
        ctx.fillStyle = `rgba(200, 228, 245, ${alpha})`
        ctx.fill()

        if (radius > 1.5) {
          ctx.beginPath()
          ctx.arc(b.x - radius * 0.3, b.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.5})`
          ctx.fill()
        }
      }

      animId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

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
