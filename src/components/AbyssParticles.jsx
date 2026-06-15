import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 20 : 45
const LURE_RADIUS = 4.5

function AnglerLure({ positionRef }) {
  const groupRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const x = Math.sin(t * 0.15) * 4.5 + Math.cos(t * 0.09 + 2) * 2
    const y = Math.sin(t * 0.11 + 1.3) * 2.5 + Math.cos(t * 0.07) * 1
    const z = Math.cos(t * 0.08) * 0.5 + 2.5

    groupRef.current.position.set(x, y, z)
    positionRef.current.set(x, y, z)

    const pulse = Math.sin(t * 1.2) * 0.25 + 0.75
    glowRef.current.scale.setScalar(pulse)
    glowRef.current.material.opacity = 0.1 + pulse * 0.08
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#FFB3D9" toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshBasicMaterial
          color="#F72585"
          transparent
          opacity={0.15}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Particles({ lurePositionRef }) {
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
    const lurePos = lurePositionRef.current

    particles.forEach((p, i) => {
      const x = p.x + Math.sin(t * p.driftX * 3 + p.phase) * 2
      const y = p.y + Math.sin(t * p.driftY + p.phase) * 0.8
      const z = p.z + Math.cos(t * 0.03 + p.phase) * 0.2

      const pulse = Math.sin(t * p.pulseSpeed + p.phase) * 0.5 + 0.5
      let scale = p.baseScale * (0.4 + pulse * 0.6)

      let brightness = 0.2 + pulse * 0.8

      const dx = x - lurePos.x
      const dy = y - lurePos.y
      const dz = z - lurePos.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const lureFactor = Math.max(0, 1 - dist / LURE_RADIUS)
      const lureInfluence = lureFactor * lureFactor
      brightness += lureInfluence * 3
      scale += p.baseScale * lureInfluence * 2

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

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
      <meshBasicMaterial vertexColors transparent opacity={0.4} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

function AbyssScene() {
  const lurePos = useRef(new THREE.Vector3(0, 0, 2.5))

  return (
    <>
      <Particles lurePositionRef={lurePos} />
      <AnglerLure positionRef={lurePos} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={3.0} luminanceThreshold={0.0} luminanceSmoothing={0.15} />
      </EffectComposer>
    </>
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
        dpr={IS_MOBILE ? 1 : [1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
        }}
      >
        <AbyssScene />
      </Canvas>
    </Suspense>
  )
}
