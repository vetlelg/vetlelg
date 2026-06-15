import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 30

function Particles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 14,
        z: (Math.random() - 0.5) * 6,
        driftX: (Math.random() - 0.5) * 0.006,
        driftY: Math.random() * 0.008 + 0.002,
        baseScale: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.15 + 0.05,
      })
    }
    return arr
  }, [])

  const colorBase = useMemo(() => new THREE.Color('#F72585'), [])
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
      const x = p.x + Math.sin(t * p.driftX * 3 + p.phase) * 2
      const y = p.y + Math.sin(t * p.driftY + p.phase) * 0.8
      const z = p.z + Math.cos(t * 0.03 + p.phase) * 0.2

      const pulse = Math.sin(t * p.pulseSpeed + p.phase) * 0.5 + 0.5
      const scale = p.baseScale * (0.4 + pulse * 0.6)

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      const brightness = 0.1 + pulse * 0.25
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
      <meshBasicMaterial vertexColors transparent opacity={0.4} />
    </instancedMesh>
  )
}

export default function AbyssParticles() {
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
