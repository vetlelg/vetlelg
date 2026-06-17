import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, HueSaturation } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

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

const TENT_COLOR = new THREE.Color('#C090E8')
const ORAL_COLOR = new THREE.Color('#A060D8')
const CA_OFFSET = new THREE.Vector2(0.0012, 0.0006)

const creatureVertex = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;

  float hash31(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i+vec3(1,0,0)), f.x),
          mix(hash31(i+vec3(0,1,0)), hash31(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i+vec3(0,0,1)), hash31(i+vec3(1,0,1)), f.x),
          mix(hash31(i+vec3(0,1,1)), hash31(i+vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    float disp = noise3(position * 5.0 + uTime * 0.3) * 0.015;
    vec3 pos = position + normal * disp;
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const jellyFragment = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uOpacity;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - abs(dot(vNormal, viewDir));
    fresnel = pow(fresnel, 2.0);

    float veins = pow(abs(sin(vUv.x * 12.0 * 3.14159)), 8.0);
    veins *= smoothstep(0.1, 0.3, vUv.y) * smoothstep(0.95, 0.5, vUv.y);
    float veinPulse = sin(uTime * 0.6 - vUv.y * 5.0) * 0.5 + 0.5;
    veins *= 0.4 + veinPulse * 0.6;

    float sss = pow(max(0.0, dot(vNormal, viewDir)), 1.8) * 0.2;

    vec3 color = mix(uColor, uGlowColor, fresnel * 0.5);
    color += uGlowColor * veins * 0.3;
    color += uGlowColor * sss * 0.5;
    color += uGlowColor * fresnel * 1.2;

    float alpha = uOpacity * (0.5 + fresnel * 0.8 + veins * 0.15 + sss * 0.3);
    alpha = clamp(alpha, 0.0, 0.85);

    gl_FragColor = vec4(color, alpha);
  }
`

function Jellyfish({ startPosition = [0, 0, 0], jellyScale = 1 }) {
  const groupRef = useRef()
  const bellRef = useRef()
  const innerRef = useRef()
  const bellMatRef = useRef()
  const innerMatRef = useRef()

  const bellUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#9B4FD0') },
    uGlowColor: { value: new THREE.Color('#D4A0FF') },
    uOpacity: { value: 0.25 },
  }), [])

  const innerUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#B070E8') },
    uGlowColor: { value: new THREE.Color('#E0C0FF') },
    uOpacity: { value: 0.18 },
  }), [])

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
      const colors = new Float32Array(TENTACLE_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
      })
      return new THREE.Line(geom, mat)
    })
  }, [])

  const oralArms = useMemo(() => {
    return Array.from({ length: ORAL_COUNT }, () => {
      const pos = new Float32Array(ORAL_SEGS * 3)
      const colors = new Float32Array(ORAL_SEGS * 3)
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
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

    if (bellMatRef.current) bellMatRef.current.uniforms.uTime.value = t
    if (innerMatRef.current) innerMatRef.current.uniforms.uTime.value = t

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

      const colorAttr = line.geometry.attributes.color
      for (let j = 0; j < TENTACLE_SEGS; j++) {
        const f = j / (TENTACLE_SEGS - 1)
        const fade = 1.0 - f * 0.8
        const glow = Math.sin(t * 1.2 - f * 3.0 + ti * 0.7) * 0.15 + 0.85
        const b = fade * glow
        colorAttr.array[j * 3] = TENT_COLOR.r * b
        colorAttr.array[j * 3 + 1] = TENT_COLOR.g * b
        colorAttr.array[j * 3 + 2] = TENT_COLOR.b * b
      }
      colorAttr.needsUpdate = true
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

      const colorAttr = line.geometry.attributes.color
      for (let j = 0; j < ORAL_SEGS; j++) {
        const f = j / (ORAL_SEGS - 1)
        const fade = 1.0 - f * 0.7
        const glow = Math.sin(t * 1.5 - f * 2.5 + ti * 0.9) * 0.12 + 0.88
        const b = fade * glow
        colorAttr.array[j * 3] = ORAL_COLOR.r * b
        colorAttr.array[j * 3 + 1] = ORAL_COLOR.g * b
        colorAttr.array[j * 3 + 2] = ORAL_COLOR.b * b
      }
      colorAttr.needsUpdate = true
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
        <shaderMaterial
          ref={bellMatRef}
          uniforms={bellUniforms}
          vertexShader={creatureVertex}
          fragmentShader={jellyFragment}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={innerRef} geometry={innerGeom}>
        <shaderMaterial
          ref={innerMatRef}
          uniforms={innerUniforms}
          vertexShader={creatureVertex}
          fragmentShader={jellyFragment}
          transparent
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
          {!IS_MOBILE && <ChromaticAberration offset={CA_OFFSET} radialModulation />}
          <Vignette darkness={0.35} offset={0.5} />
          {!IS_MOBILE && <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.02} />}
          <HueSaturation saturation={-0.05} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
