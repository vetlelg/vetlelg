import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const BUBBLE_COUNT = IS_MOBILE ? 12 : 30

const BUBBLE_DATA = Array.from({ length: BUBBLE_COUNT }, () => ({
  x: (Math.random() - 0.5) * 5,
  y: Math.random() * 6 - 3,
  z: Math.random() * 1.2 + 0.3,
  speed: Math.random() * 0.25 + 0.08,
  wobbleSpeed: Math.random() * 1.0 + 0.5,
  wobbleAmp: Math.random() * 0.2 + 0.05,
  scale: Math.random() * 0.012 + 0.003,
  phase: Math.random() * Math.PI * 2,
}))

function Bubbles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const bubbles = BUBBLE_DATA

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

function Whale() {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/whale.glb`)
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    const first = Object.values(actions)[0]
    if (first) first.play()
  }, [actions])

  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.transparent = true
        child.material.opacity = 0.35
        child.material.depthWrite = false
        child.material.toneMapped = false
      }
    })
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.x = Math.sin(t * 0.1) * 2.5
    groupRef.current.position.y = -0.3 + Math.sin(t * 0.13) * 0.8
    groupRef.current.position.z = Math.sin(t * 0.07) * 0.5
    const vx = Math.cos(t * 0.1)
    const vz = Math.cos(t * 0.07) * 0.2
    groupRef.current.rotation.y = Math.atan2(-vz, vx) - Math.PI / 4
    groupRef.current.rotation.z = -vx * 0.05
  })

  return (
    <group ref={groupRef} scale={0.6}>
      <primitive object={scene} />
    </group>
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
        <FrameloopControl sectionId="hero" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 5, 3]} intensity={0.5} color="#CAF0F8" />
        <Bubbles />
        {!IS_MOBILE && <Whale />}
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.4} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
