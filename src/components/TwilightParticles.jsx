import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 18 : 40

function Particles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 16,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 5,
        driftX: (Math.random() - 0.5) * 0.04,
        driftY: (Math.random() - 0.5) * 0.02,
        baseScale: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.8 + 0.3,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      const x = p.x + Math.sin(t * p.driftX * 2 + p.phase) * 1.2
      const y = p.y + Math.cos(t * 0.15 + p.phase) * 0.6
      const z = p.z + Math.sin(t * 0.1 + p.phase) * 0.4

      const pulse = Math.pow(Math.sin(t * p.pulseSpeed + p.phase) * 0.5 + 0.5, 2)
      const scale = p.baseScale * (0.4 + pulse * 0.8)

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#7B2FBE" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

const TENTACLE_COUNT = IS_MOBILE ? 5 : 8
const TENTACLE_SEGS = IS_MOBILE ? 16 : 28
const ORAL_COUNT = 4
const ORAL_SEGS = IS_MOBILE ? 10 : 16

function Jellyfish({ startPosition = [0, 0, 0], jellyScale = 1 }) {
  const groupRef = useRef()
  const bellRef = useRef()
  const innerRef = useRef()

  const bellGeom = useMemo(() => {
    const profile = []
    const N = 24
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const angle = t * Math.PI * 0.55
      const r = Math.sin(angle) * 0.5
      const y = Math.cos(angle) * 0.4
      profile.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(profile, 20)
  }, [])

  const innerGeom = useMemo(() => {
    const profile = []
    const N = 20
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const angle = t * Math.PI * 0.5
      const r = Math.sin(angle) * 0.38
      const y = Math.cos(angle) * 0.32
      profile.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(profile, 16)
  }, [])

  const tentacles = useMemo(() => {
    return Array.from({ length: TENTACLE_COUNT }, () => {
      const pos = new Float32Array(TENTACLE_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.LineBasicMaterial({
        color: '#C090E8',
        transparent: true,
        opacity: 0.45,
      })
      return new THREE.Line(geom, mat)
    })
  }, [])

  const oralArms = useMemo(() => {
    return Array.from({ length: ORAL_COUNT }, () => {
      const pos = new Float32Array(ORAL_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.LineBasicMaterial({
        color: '#A060D8',
        transparent: true,
        opacity: 0.5,
      })
      return new THREE.Line(geom, mat)
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = groupRef.current
    if (!g) return

    g.position.x = startPosition[0] + Math.sin(t * 0.07 + startPosition[0]) * 3.5
    g.position.y = startPosition[1] + Math.sin(t * 0.11 + startPosition[1]) * 0.9
    g.position.z = startPosition[2] + Math.sin(t * 0.05 + startPosition[2]) * 0.4
    g.rotation.z = Math.sin(t * 0.12) * 0.06
    g.rotation.x = Math.sin(t * 0.09) * 0.04

    const pulse = Math.sin(t * 1.0)
    const expand = pulse > 0 ? pulse * 0.14 : pulse * 0.08
    const sXZ = 1 + expand
    const sY = 1 - expand * 0.6
    bellRef.current.scale.set(sXZ, sY, sXZ)
    innerRef.current.scale.set(sXZ * 0.96, sY * 0.96, sXZ * 0.96)

    tentacles.forEach((line, ti) => {
      const attr = line.geometry.attributes.position
      const a = (ti / TENTACLE_COUNT) * Math.PI * 2
      const bR = 0.42 * sXZ
      const bx = Math.cos(a) * bR
      const bz = Math.sin(a) * bR
      const len = 1.0 + Math.sin(ti * 1.7) * 0.5

      for (let j = 0; j < TENTACLE_SEGS; j++) {
        const f = j / (TENTACLE_SEGS - 1)
        const d = f * 3.5
        attr.array[j * 3] = bx * (1 - f * 0.4) + Math.sin(t * 1.3 - d + ti * 0.9) * f * 0.35
        attr.array[j * 3 + 1] = -f * len
        attr.array[j * 3 + 2] = bz * (1 - f * 0.4) + Math.cos(t * 1.1 - d + ti * 1.3) * f * 0.3
      }
      attr.needsUpdate = true
    })

    oralArms.forEach((line, ti) => {
      const attr = line.geometry.attributes.position
      const a = (ti / ORAL_COUNT) * Math.PI * 2 + Math.PI / ORAL_COUNT
      const bx = Math.cos(a) * 0.15
      const bz = Math.sin(a) * 0.15

      for (let j = 0; j < ORAL_SEGS; j++) {
        const f = j / (ORAL_SEGS - 1)
        const d = f * 4
        attr.array[j * 3] = bx + Math.sin(t * 1.8 - d + ti * 1.4) * f * 0.22
        attr.array[j * 3 + 1] = -f * 0.55
        attr.array[j * 3 + 2] = bz + Math.cos(t * 1.5 - d + ti * 1.7) * f * 0.18
      }
      attr.needsUpdate = true
    })
  })

  useEffect(() => {
    return () => {
      bellGeom.dispose()
      innerGeom.dispose()
      tentacles.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
      oralArms.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
    }
  }, [bellGeom, innerGeom, tentacles, oralArms])

  return (
    <group ref={groupRef} scale={jellyScale}>
      <mesh ref={bellRef} geometry={bellGeom}>
        <meshBasicMaterial
          color="#9B4FD0"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerRef} geometry={innerGeom}>
        <meshBasicMaterial
          color="#B070E8"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {tentacles.map((line, i) => (
        <primitive key={`t${i}`} object={line} />
      ))}
      {oralArms.map((line, i) => (
        <primitive key={`o${i}`} object={line} />
      ))}
    </group>
  )
}

export default function TwilightParticles() {
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
        <Particles />
        <Jellyfish startPosition={[2, 0.5, -0.5]} jellyScale={1.2} />
        <Jellyfish startPosition={[-3.5, -1, -2.5]} jellyScale={0.55} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.8} luminanceThreshold={0.0} luminanceSmoothing={0.2} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
