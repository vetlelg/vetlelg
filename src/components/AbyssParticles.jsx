import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise, HueSaturation } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { WaterDistortion } from '../effects/WaterDistortion'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 20 : 45
const LURE_RADIUS = 4.5
const CA_OFFSET = new THREE.Vector2(0.003, 0.0015)

const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, () => ({
  x: (Math.random() - 0.5) * 20,
  y: (Math.random() - 0.5) * 14,
  z: (Math.random() - 0.5) * 6,
  driftX: (Math.random() - 0.5) * 0.006,
  driftY: Math.random() * 0.008 + 0.002,
  baseScale: Math.random() * 0.02 + 0.005,
  phase: Math.random() * Math.PI * 2,
  pulseSpeed: Math.random() * 0.15 + 0.05,
}))

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

  const particles = PARTICLE_DATA

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
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/anglerfish.glb`)
  const { actions } = useAnimations(animations, groupRef)
  const smoothPos = useRef(new THREE.Vector3(0.5, -1.0, 2.0))
  const materialsRef = useRef([])

  useEffect(() => {
    const first = Object.values(actions)[0]
    if (first) {
      first.timeScale = 0.4
      first.play()
    }
  }, [actions])

  useMemo(() => {
    const baseColor = new THREE.Color('#150025')
    const rimColor = new THREE.Color('#F72585')
    const mats = []

    scene.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone()
        mat.transparent = true
        mat.opacity = 0.08
        mat.depthWrite = false
        mat.toneMapped = false

        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          mat.color = baseColor.clone()
          mat.emissive = new THREE.Color('#F72585')
          mat.emissiveIntensity = 0.04
          mat.metalness = 0
          mat.roughness = 1
        }

        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uRimColor = { value: rimColor }
          shader.uniforms.uRimPower = { value: 2.5 }
          shader.uniforms.uRimIntensity = { value: 0.25 }

          shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `varying vec3 vFresnelViewDir;
            varying vec3 vFresnelNormal;
            void main() {`
          )

          shader.vertexShader = shader.vertexShader.replace(
            '#include <clipping_planes_vertex>',
            `vec4 fresnelMVPos = modelViewMatrix * vec4(transformed, 1.0);
            vFresnelViewDir = normalize(-fresnelMVPos.xyz);
            vFresnelNormal = normalize(normalMatrix * objectNormal);
            #include <clipping_planes_vertex>`
          )

          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `uniform vec3 uRimColor;
            uniform float uRimPower;
            uniform float uRimIntensity;
            varying vec3 vFresnelViewDir;
            varying vec3 vFresnelNormal;
            void main() {`
          )

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            float fresnelTerm = pow(1.0 - abs(dot(normalize(vFresnelViewDir), normalize(vFresnelNormal))), uRimPower);
            gl_FragColor.rgb += uRimColor * fresnelTerm * uRimIntensity;
            gl_FragColor.a = max(gl_FragColor.a, fresnelTerm * uRimIntensity * 0.3);`
          )
        }

        mat.customProgramCacheKey = () => 'angler-fresnel'
        mat.needsUpdate = true
        child.material = mat
        mats.push(mat)
      }
    })
    materialsRef.current = mats
  }, [scene])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const lp = lurePositionRef.current

    const lag = 0.02
    smoothPos.current.x += (lp.x * 0.3 + 0.5 - smoothPos.current.x) * lag
    smoothPos.current.y += ((lp.y - 1.0) - smoothPos.current.y) * lag
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

    materialsRef.current.forEach(mat => {
      mat.opacity = 0.07 + vis * 0.15
    })
  })

  return (
    <group ref={groupRef} scale={0.8}>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
      <pointLight color="#F72585" intensity={0.1} distance={4} decay={2} />
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
        {!IS_MOBILE && <WaterDistortion strength={0.001} speed={0.3} />}
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
