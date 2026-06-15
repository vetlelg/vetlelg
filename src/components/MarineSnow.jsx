import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const SNOW_COUNT = IS_MOBILE ? 800 : 2000

function Snow() {
  const pointsRef = useRef()

  const { positions, fallSpeeds, driftPhases, driftAmps } = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3)
    const speeds = new Float32Array(SNOW_COUNT)
    const phases = new Float32Array(SNOW_COUNT)
    const amps = new Float32Array(SNOW_COUNT)

    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = Math.random() * -8

      speeds[i] = Math.random() * 0.008 + 0.002
      phases[i] = Math.random() * Math.PI * 2
      amps[i] = Math.random() * 0.15 + 0.05
    }

    return { positions: pos, fallSpeeds: speeds, driftPhases: phases, driftAmps: amps }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pos = pointsRef.current.geometry.attributes.position.array

    for (let i = 0; i < SNOW_COUNT; i++) {
      const i3 = i * 3
      pos[i3] += Math.sin(t * 0.4 + driftPhases[i]) * driftAmps[i] * 0.005
      pos[i3 + 1] -= fallSpeeds[i]

      if (pos[i3 + 1] < -8) {
        pos[i3 + 1] = 8 + Math.random() * 2
        pos[i3] = (Math.random() - 0.5) * 22
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#94b8d0"
        size={0.03}
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default function MarineSnow() {
  const containerRef = useRef(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced || !containerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: '#education',
      start: 'top bottom',
      end: 'top 30%',
      scrub: true,
      onUpdate: (self) => {
        if (containerRef.current) {
          containerRef.current.style.opacity = self.progress
        }
      },
    })

    return () => trigger.kill()
  }, [prefersReduced])

  if (prefersReduced) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0,
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={1}
          gl={{ alpha: true, antialias: false }}
        >
          <Snow />
        </Canvas>
      </Suspense>
    </div>
  )
}
