import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 60

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
      <meshBasicMaterial color="#90E0EF" transparent opacity={0.4} />
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
        dpr={[1, 1.5]}
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
        <Particles />
      </Canvas>
    </Suspense>
  )
}
