import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, HueSaturation } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

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

function AnglerBody({ lurePositionRef }) {
  const groupRef = useRef()
  const bodyMatRef = useRef()
  const jawMatRef = useRef()
  const smoothPos = useRef(new THREE.Vector3(0, -1.5, 2.5))

  const bodyShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 1.2)
    s.bezierCurveTo(0.85, 1.15, 1.0, 0.3, 0.9, -0.5)
    s.bezierCurveTo(0.8, -1.1, 0.4, -1.5, 0, -1.6)
    s.bezierCurveTo(-0.4, -1.5, -0.8, -1.1, -0.9, -0.5)
    s.bezierCurveTo(-1.0, 0.3, -0.85, 1.15, 0, 1.2)
    return s
  }, [])

  const jawShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.5, 0)
    s.quadraticCurveTo(0, 0.4, 0.5, 0)
    s.quadraticCurveTo(0, 0.2, -0.5, 0)
    return s
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const lp = lurePositionRef.current

    const lag = 0.012
    smoothPos.current.x += (lp.x * 0.25 - smoothPos.current.x) * lag
    smoothPos.current.y += ((lp.y - 2.0) - smoothPos.current.y) * lag
    smoothPos.current.z += (lp.z - smoothPos.current.z) * lag * 2

    groupRef.current.position.copy(smoothPos.current)
    groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.03

    const dx = lp.x - smoothPos.current.x
    const dy = lp.y - smoothPos.current.y
    const dz = lp.z - smoothPos.current.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const proximity = Math.max(0, 1 - dist / 4.0)

    const pulse = Math.sin(t * 1.2) * 0.25 + 0.75
    const vis = pulse * pulse * (0.15 + proximity * 0.85)
    bodyMatRef.current.opacity = 0.006 + vis * 0.065
    jawMatRef.current.opacity = 0.004 + vis * 0.04
  })

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 1]}>
      <mesh>
        <shapeGeometry args={[bodyShape]} />
        <meshBasicMaterial
          ref={bodyMatRef}
          color="#350050"
          transparent
          opacity={0.05}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.4, 0.005]}>
        <shapeGeometry args={[jawShape]} />
        <meshBasicMaterial
          ref={jawMatRef}
          color="#350050"
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function AbyssScene() {
  const lurePos = useRef(new THREE.Vector3(0, 0, 2.5))

  return (
    <>
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
