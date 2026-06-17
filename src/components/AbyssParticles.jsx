import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, HueSaturation } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 20 : 45
const LURE_RADIUS = 4.5
const CA_OFFSET = new THREE.Vector2(0.003, 0.0015)

const lureGlowVertex = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const lureGlowFragment = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uColor;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float facing = abs(dot(vNormal, viewDir));

    float glow = pow(facing, 1.5);
    float flicker = 1.0 + sin(uTime * 7.0) * 0.06 + sin(uTime * 11.3) * 0.04;

    float intensity = glow * uPulse * flicker;
    vec3 color = uColor * (1.0 + intensity * 3.0);
    float alpha = intensity * 0.3;

    gl_FragColor = vec4(color, alpha);
  }
`

function AnglerLure({ positionRef }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const glowMatRef = useRef()

  const glowUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPulse: { value: 0.75 },
    uColor: { value: new THREE.Color('#F72585') },
  }), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const x = Math.sin(t * 0.15) * 4.5 + Math.cos(t * 0.09 + 2) * 2
    const y = Math.sin(t * 0.11 + 1.3) * 2.5 + Math.cos(t * 0.07) * 1
    const z = Math.cos(t * 0.08) * 0.5 + 2.5

    groupRef.current.position.set(x, y, z)
    positionRef.current.set(x, y, z)

    const pulse = Math.sin(t * 1.2) * 0.25 + 0.75
    glowRef.current.scale.setScalar(pulse)
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uTime.value = t
      glowMatRef.current.uniforms.uPulse.value = pulse
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#FFB3D9" toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <shaderMaterial
          ref={glowMatRef}
          uniforms={glowUniforms}
          vertexShader={lureGlowVertex}
          fragmentShader={lureGlowFragment}
          transparent
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

const STALK_SEGMENTS = 20

function AnglerBody({ lurePositionRef }) {
  const groupRef = useRef()
  const jawRef = useRef()
  const bodyMatRef = useRef()
  const jawMatRef = useRef()
  const teethMatRef = useRef()
  const eyeMatRef = useRef()
  const tailMatRef = useRef()
  const smoothPos = useRef(new THREE.Vector3(0, -1.5, 2.5))

  const bodyShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1.15)
    s.bezierCurveTo(0.5, 1.1, 0.8, 0.85, 0.95, 0.5)
    s.bezierCurveTo(1.1, 0.1, 1.1, -0.35, 1.0, -0.7)
    s.bezierCurveTo(0.85, -1.05, 0.6, -1.35, 0.35, -1.55)
    s.bezierCurveTo(0.15, -1.65, 0, -1.7, 0, -1.7)
    s.bezierCurveTo(0, -1.7, -0.15, -1.65, -0.35, -1.55)
    s.bezierCurveTo(-0.6, -1.35, -0.85, -1.05, -1.0, -0.7)
    s.bezierCurveTo(-1.1, -0.35, -1.1, 0.1, -0.95, 0.5)
    s.bezierCurveTo(-0.8, 0.85, -0.5, 1.1, 0, 1.15)
    return s
  }, [])

  const jawShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.65, 0)
    s.bezierCurveTo(-0.45, 0.45, 0.45, 0.45, 0.7, 0)
    s.bezierCurveTo(0.35, 0.18, -0.3, 0.18, -0.65, 0)
    return s
  }, [])

  const teethShape = useMemo(() => {
    const s = new THREE.Shape()
    const teeth = [
      { x: -0.5, w: 0.04, h: 0.14 },
      { x: -0.3, w: 0.035, h: 0.19 },
      { x: -0.1, w: 0.04, h: 0.23 },
      { x: 0.1, w: 0.04, h: 0.21 },
      { x: 0.3, w: 0.035, h: 0.17 },
      { x: 0.5, w: 0.035, h: 0.12 },
    ]
    s.moveTo(teeth[0].x - teeth[0].w, 0)
    teeth.forEach(({ x, w, h }) => {
      s.lineTo(x - w, 0)
      s.lineTo(x, h)
      s.lineTo(x + w, 0)
    })
    s.lineTo(teeth[0].x - teeth[0].w, 0)
    return s
  }, [])

  const eyeShape = useMemo(() => {
    const s = new THREE.Shape()
    s.absarc(0, 0, 0.055, 0, Math.PI * 2, false)
    return s
  }, [])

  const tailFinShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.1, 0.05, 0.3, 0.22, 0.4, 0.3)
    s.bezierCurveTo(0.28, 0.15, 0.12, 0.03, 0.08, 0)
    s.bezierCurveTo(0.12, -0.03, 0.28, -0.15, 0.35, -0.25)
    s.bezierCurveTo(0.25, -0.18, 0.1, -0.05, 0, 0)
    return s
  }, [])

  const stalkMatRef = useRef()
  const stalkGeoRef = useRef()

  const stalkLine = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STALK_SEGMENTS * 3), 3))
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#250040'),
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
      toneMapped: false,
    })
    return new THREE.Line(geo, mat)
  }, [])

  useEffect(() => {
    stalkMatRef.current = stalkLine.material
    stalkGeoRef.current = stalkLine.geometry
    return () => {
      stalkLine.geometry.dispose()
      stalkLine.material.dispose()
    }
  }, [stalkLine])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const lp = lurePositionRef.current

    const lag = 0.012
    smoothPos.current.x += (lp.x * 0.25 - smoothPos.current.x) * lag
    smoothPos.current.y += ((lp.y - 2.0) - smoothPos.current.y) * lag
    smoothPos.current.z += (lp.z - smoothPos.current.z) * lag * 2

    groupRef.current.position.copy(smoothPos.current)
    groupRef.current.rotation.z = Math.sin(t * 0.08) * 0.04

    const dx = lp.x - smoothPos.current.x
    const dy = lp.y - smoothPos.current.y
    const dz = lp.z - smoothPos.current.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const proximity = Math.max(0, 1 - dist / 4.0)

    const pulse = Math.sin(t * 1.2) * 0.25 + 0.75
    const vis = pulse * pulse * (0.15 + proximity * 0.85)

    bodyMatRef.current.opacity = 0.04 + vis * 0.14
    jawMatRef.current.opacity = 0.035 + vis * 0.12
    teethMatRef.current.opacity = 0.05 + vis * 0.18
    eyeMatRef.current.opacity = 0.08 + vis * 0.3
    tailMatRef.current.opacity = 0.025 + vis * 0.1
    if (stalkMatRef.current) stalkMatRef.current.opacity = 0.015 + vis * 0.06

    jawRef.current.position.y = 1.2 + Math.sin(t * 0.3) * 0.04

    const lureLocalX = lp.x - smoothPos.current.x
    const lureLocalY = lp.y - smoothPos.current.y
    const lureLocalZ = lp.z - smoothPos.current.z
    const cpX = (0.05 + lureLocalX) * 0.5
    const cpY = Math.max(1.15, lureLocalY) + 0.6
    const cpZ = lureLocalZ * 0.5

    if (stalkGeoRef.current) {
      const positions = stalkGeoRef.current.attributes.position.array
      for (let i = 0; i < STALK_SEGMENTS; i++) {
        const f = i / (STALK_SEGMENTS - 1)
        const omt = 1 - f
        positions[i * 3] = omt * omt * 0.05 + 2 * omt * f * cpX + f * f * lureLocalX
        positions[i * 3 + 1] = omt * omt * 1.15 + 2 * omt * f * cpY + f * f * lureLocalY
        positions[i * 3 + 2] = 2 * omt * f * cpZ + f * f * lureLocalZ
      }
      stalkGeoRef.current.attributes.position.needsUpdate = true
    }
  })

  const bodyColor = '#250040'

  return (
    <group ref={groupRef}>
      <mesh>
        <shapeGeometry args={[bodyShape]} />
        <meshBasicMaterial
          ref={bodyMatRef}
          color={bodyColor}
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={jawRef} position={[0, 1.2, 0.005]}>
        <shapeGeometry args={[jawShape]} />
        <meshBasicMaterial
          ref={jawMatRef}
          color={bodyColor}
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.12, 0.008]}>
        <shapeGeometry args={[teethShape]} />
        <meshBasicMaterial
          ref={teethMatRef}
          color="#350055"
          transparent
          opacity={0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.4, 0.7, 0.01]}>
        <shapeGeometry args={[eyeShape]} />
        <meshBasicMaterial
          ref={eyeMatRef}
          color="#F72585"
          transparent
          opacity={0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -1.65, 0.003]}>
        <shapeGeometry args={[tailFinShape]} />
        <meshBasicMaterial
          ref={tailMatRef}
          color={bodyColor}
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <primitive object={stalkLine} />
    </group>
  )
}

function AbyssScene() {
  const lurePos = useRef(new THREE.Vector3(0, 0, 2.5))

  return (
    <>
      <FrameloopControl sectionId="contact" />
      <AnglerBody lurePositionRef={lurePos} />
      <Particles lurePositionRef={lurePos} />
      <AnglerLure positionRef={lurePos} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={3.0} luminanceThreshold={0.0} luminanceSmoothing={0.15} />
        {!IS_MOBILE && <ChromaticAberration offset={CA_OFFSET} radialModulation />}
        <Vignette darkness={0.6} offset={0.4} />
        {!IS_MOBILE && <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.05} />}
        <HueSaturation saturation={-0.15} />
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
