import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const BUBBLE_COUNT = IS_MOBILE ? 12 : 30

function Bubbles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const bubbles = useMemo(() => {
    const arr = []
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 6 - 3,
        z: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.25 + 0.08,
        wobbleSpeed: Math.random() * 1.0 + 0.5,
        wobbleAmp: Math.random() * 0.2 + 0.05,
        scale: Math.random() * 0.012 + 0.003,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    bubbles.forEach((b, i) => {
      let y = b.y + t * b.speed
      const range = 5
      y = ((y % range) + range) % range - range / 2

      const x = b.x + Math.sin(t * b.wobbleSpeed + b.phase) * b.wobbleAmp
      const z = b.z + Math.cos(t * b.wobbleSpeed * 0.7 + b.phase) * 0.05

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(b.scale * (1 + Math.sin(t + b.phase) * 0.1))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color="#CAF0F8" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

export default function HeroCaustics() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return null

  return (
    <Suspense fallback={null}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 60 }}
        dpr={IS_MOBILE ? 1 : [1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Bubbles />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.4} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
