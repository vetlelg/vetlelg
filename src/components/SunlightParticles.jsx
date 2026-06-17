import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 25 : 60
const FISH_COUNT = IS_MOBILE ? 6 : 12
const FISH_COLOR = new THREE.Color('#90E0EF')
const CA_OFFSET = new THREE.Vector2(0.0006, 0.0003)

function Particles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 4,
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: Math.random() * 0.04 + 0.01,
        scale: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      const x = p.x + Math.sin(t * 0.3 + p.phase) * 0.5
      const y = p.y + Math.sin(t * p.speedY + p.phase) * 0.8
      const z = p.z + Math.cos(t * 0.2 + p.phase) * 0.3
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 0.5 + p.phase) * 0.3))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#90E0EF" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  )
}

function FishSchool() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const fishShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0.18, 0)
    shape.lineTo(0.08, 0.024)
    shape.lineTo(0, 0.028)
    shape.lineTo(-0.06, 0.02)
    shape.lineTo(-0.1, 0.006)
    shape.lineTo(-0.16, 0.035)
    shape.lineTo(-0.11, 0)
    shape.lineTo(-0.16, -0.035)
    shape.lineTo(-0.1, -0.006)
    shape.lineTo(-0.06, -0.02)
    shape.lineTo(0, -0.028)
    shape.lineTo(0.08, -0.024)
    shape.closePath()
    return shape
  }, [])

  const colorArr = useMemo(() => {
    const arr = new Float32Array(FISH_COUNT * 3)
    for (let i = 0; i < FISH_COUNT; i++) {
      arr[i * 3] = FISH_COLOR.r
      arr[i * 3 + 1] = FISH_COLOR.g
      arr[i * 3 + 2] = FISH_COLOR.b
    }
    return arr
  }, [])

  const colorAttrRef = useRef()

  const fish = useMemo(() => {
    const arr = []
    const startAngle = Math.random() * Math.PI * 2
    const startX = (Math.random() - 0.5) * 4
    const startY = (Math.random() - 0.5) * 2

    for (let i = 0; i < FISH_COUNT; i++) {
      const angle = startAngle + (Math.random() - 0.5) * 0.6
      arr.push({
        x: startX + (Math.random() - 0.5) * 2,
        y: startY + (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        scale: 0.6 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        wanderPhase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    fish.forEach((f, i) => {
      let sepX = 0, sepY = 0
      let aliX = 0, aliY = 0
      let cohX = 0, cohY = 0
      let n = 0

      for (let j = 0; j < fish.length; j++) {
        if (i === j) continue
        const other = fish[j]
        const dx = other.x - f.x
        const dy = other.y - f.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 2.0) {
          n++
          if (dist < 0.4 && dist > 0.001) {
            sepX -= dx / dist
            sepY -= dy / dist
          }
          aliX += other.vx
          aliY += other.vy
          cohX += other.x
          cohY += other.y
        }
      }

      const wanderX = Math.cos(t * 0.3 + f.wanderPhase) * 0.008
      const wanderY = Math.sin(t * 0.25 + f.wanderPhase * 1.3) * 0.008

      if (n > 0) {
        aliX /= n
        aliY /= n
        cohX = cohX / n - f.x
        cohY = cohY / n - f.y

        f.vx += sepX * 0.05 + (aliX - f.vx) * 0.02 + cohX * 0.01 + wanderX
        f.vy += sepY * 0.05 + (aliY - f.vy) * 0.02 + cohY * 0.01 + wanderY
      } else {
        f.vx += wanderX
        f.vy += wanderY
      }

      if (f.x > 6) f.vx -= 0.02
      if (f.x < -6) f.vx += 0.02
      if (f.y > 3.5) f.vy -= 0.02
      if (f.y < -3.5) f.vy += 0.02

      const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy)
      if (speed > 0.01) {
        const ratio = 0.5 / speed
        f.vx += (f.vx * ratio - f.vx) * 0.03
        f.vy += (f.vy * ratio - f.vy) * 0.03
      }

      f.x += f.vx * dt
      f.y += f.vy * dt

      const heading = Math.atan2(f.vy, f.vx)
      const waggle = Math.sin(t * 8 + f.phase) * 0.08

      dummy.position.set(f.x, f.y, f.z)
      dummy.rotation.set(0, 0, heading + waggle)
      dummy.scale.setScalar(f.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      const glint = Math.abs(waggle) / 0.08
      const shimmer = Math.sin(t * 1.5 + f.phase * 2.7) * 0.2 + 0.85
      const brightness = shimmer + glint * 0.35
      colorArr[i * 3] = FISH_COLOR.r * brightness
      colorArr[i * 3 + 1] = FISH_COLOR.g * brightness
      colorArr[i * 3 + 2] = FISH_COLOR.b * brightness
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (colorAttrRef.current) colorAttrRef.current.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, FISH_COUNT]}>
      <shapeGeometry args={[fishShape]}>
        <instancedBufferAttribute
          ref={colorAttrRef}
          attach="attributes-color"
          args={[colorArr, 3]}
        />
      </shapeGeometry>
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.35}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

export default function SunlightParticles() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return null

  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={IS_MOBILE ? 1 : [1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <FrameloopControl sectionId="experience" />
        <Particles />
        <FishSchool />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.3} />
          {!IS_MOBILE && <ChromaticAberration offset={CA_OFFSET} />}
          <Vignette darkness={0.25} offset={0.6} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
