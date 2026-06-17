import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 35 : 80
const ARM_COUNT = IS_MOBILE ? 5 : 8
const ARM_SEGS = IS_MOBILE ? 12 : 20
const LONG_TENT_SEGS = IS_MOBILE ? 18 : 28

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
      const scale = p.baseScale * (0.3 + pulse * 0.4 + flash * 1.2)

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      const brightness = 0.3 + pulse * 0.5 + flash * 1.5
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
      <meshBasicMaterial vertexColors transparent opacity={0.6} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

function Squid({ startPosition = [0, 0, 0], squidScale = 1 }) {
  const groupRef = useRef()
  const mantleRef = useRef()
  const innerRef = useRef()

  const mantleGeom = useMemo(() => {
    const profile = []
    const N = 20
    for (let i = 0; i <= N; i++) {
      const t = i / N
      let r
      if (t < 0.25) {
        r = Math.sin((t / 0.25) * Math.PI * 0.5) * 0.18
      } else {
        r = 0.18 + (t - 0.25) * 0.04
      }
      const y = 0.55 - t * 0.95
      profile.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(profile, 16)
  }, [])

  const innerGeom = useMemo(() => {
    const profile = []
    const N = 16
    for (let i = 0; i <= N; i++) {
      const t = i / N
      let r
      if (t < 0.25) {
        r = Math.sin((t / 0.25) * Math.PI * 0.5) * 0.14
      } else {
        r = 0.14 + (t - 0.25) * 0.03
      }
      const y = 0.50 - t * 0.85
      profile.push(new THREE.Vector2(r, y))
    }
    return new THREE.LatheGeometry(profile, 12)
  }, [])

  const arms = useMemo(() => {
    return Array.from({ length: ARM_COUNT }, () => {
      const pos = new Float32Array(ARM_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.LineBasicMaterial({
        color: '#50E8C0',
        transparent: true,
        opacity: 0.4,
      })
      return new THREE.Line(geom, mat)
    })
  }, [])

  const longTentacles = useMemo(() => {
    return Array.from({ length: 2 }, () => {
      const pos = new Float32Array(LONG_TENT_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.LineBasicMaterial({
        color: '#80FFE8',
        transparent: true,
        opacity: 0.3,
      })
      return new THREE.Line(geom, mat)
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = groupRef.current
    if (!g) return

    g.position.x = startPosition[0] + Math.sin(t * 0.08 + startPosition[0]) * 3
    g.position.y = startPosition[1] + Math.sin(t * 0.1 + startPosition[1]) * 1.2
    g.position.z = startPosition[2] + Math.sin(t * 0.06 + startPosition[2]) * 0.5
    g.rotation.z = Math.sin(t * 0.1) * 0.08
    g.rotation.x = Math.sin(t * 0.07) * 0.05

    const pulse = Math.sin(t * 1.0)
    const expand = pulse > 0 ? pulse * 0.14 : pulse * 0.08
    const sXZ = 1 + expand
    const sY = 1 - expand * 0.5
    mantleRef.current.scale.set(sXZ, sY, sXZ)
    innerRef.current.scale.set(sXZ * 0.95, sY * 0.95, sXZ * 0.95)

    arms.forEach((line, ai) => {
      const attr = line.geometry.attributes.position
      const a = (ai / ARM_COUNT) * Math.PI * 2
      const baseR = 0.2
      const bx = Math.cos(a) * baseR
      const bz = Math.sin(a) * baseR
      const len = 0.5 + Math.sin(ai * 1.3) * 0.15

      for (let j = 0; j < ARM_SEGS; j++) {
        const f = j / (ARM_SEGS - 1)
        const d = f * 3
        attr.array[j * 3] = bx * (1 - f * 0.3) + Math.sin(t * 1.5 - d + ai * 0.8) * f * 0.2
        attr.array[j * 3 + 1] = -0.4 - f * len
        attr.array[j * 3 + 2] = bz * (1 - f * 0.3) + Math.cos(t * 1.2 - d + ai * 1.1) * f * 0.15
      }
      attr.needsUpdate = true
    })

    longTentacles.forEach((line, ti) => {
      const attr = line.geometry.attributes.position
      const a = ti * Math.PI + Math.PI * 0.25
      const bx = Math.cos(a) * 0.1
      const bz = Math.sin(a) * 0.1

      for (let j = 0; j < LONG_TENT_SEGS; j++) {
        const f = j / (LONG_TENT_SEGS - 1)
        const d = f * 4
        attr.array[j * 3] = bx + Math.sin(t * 1.0 - d + ti * 2.0) * f * 0.35
        attr.array[j * 3 + 1] = -0.4 - f * 1.2
        attr.array[j * 3 + 2] = bz + Math.cos(t * 0.8 - d + ti * 2.5) * f * 0.25
      }
      attr.needsUpdate = true
    })
  })

  useEffect(() => {
    return () => {
      mantleGeom.dispose()
      innerGeom.dispose()
      arms.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
      longTentacles.forEach((l) => { l.geometry.dispose(); l.material.dispose() })
    }
  }, [mantleGeom, innerGeom, arms, longTentacles])

  return (
    <group ref={groupRef} scale={squidScale}>
      <mesh ref={mantleRef} geometry={mantleGeom}>
        <meshBasicMaterial
          color="#00B89A"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerRef} geometry={innerGeom}>
        <meshBasicMaterial
          color="#30E8C4"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.28, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#AAFFF0" toneMapped={false} />
      </mesh>
      {arms.map((line, i) => (
        <primitive key={`arm${i}`} object={line} />
      ))}
      {longTentacles.map((line, i) => (
        <primitive key={`tent${i}`} object={line} />
      ))}
    </group>
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
        <Squid startPosition={[2, 0.5, -0.5]} squidScale={1.3} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={2.5} luminanceThreshold={0.0} luminanceSmoothing={0.2} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
