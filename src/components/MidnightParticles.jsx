import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 80

function Particles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.5) * 12,
        z: (Math.random() - 0.5) * 6,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.015,
        baseScale: Math.random() * 0.03 + 0.008,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.4 + 0.1,
        flashPhase: Math.random() * Math.PI * 2,
        flashInterval: Math.random() * 8 + 6,
      })
    }
    return arr
  }, [])

  const colorBase = useMemo(() => new THREE.Color('#00F5D4'), [])
  const colorArr = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = colorBase.r
      arr[i * 3 + 1] = colorBase.g
      arr[i * 3 + 2] = colorBase.b
    }
    return arr
  }, [colorBase])

  const colorAttrRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      const x = p.x + Math.sin(t * p.driftX * 2 + p.phase) * 1.5
      const y = p.y + Math.cos(t * 0.08 + p.phase) * 0.4
      const z = p.z + Math.sin(t * 0.06 + p.phase) * 0.3

      const flash = Math.pow(
        Math.max(0, Math.sin(t / p.flashInterval + p.flashPhase)),
        12
      )
      const pulse = Math.sin(t * p.pulseSpeed + p.phase) * 0.5 + 0.5
      const scale = p.baseScale * (0.3 + pulse * 0.4 + flash * 2.5)

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      const brightness = 0.2 + pulse * 0.3 + flash * 0.5
      colorArr[i * 3] = colorBase.r * brightness
      colorArr[i * 3 + 1] = colorBase.g * brightness
      colorArr[i * 3 + 2] = colorBase.b * brightness
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (colorAttrRef.current) {
      colorAttrRef.current.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]}>
        <instancedBufferAttribute
          ref={colorAttrRef}
          attach="attributes-color"
          args={[colorArr, 3]}
        />
      </sphereGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.6} />
    </instancedMesh>
  )
}

export default function MidnightParticles() {
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
        }}
      >
        <Particles />
      </Canvas>
    </Suspense>
  )
}
