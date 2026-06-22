import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { WaterDistortion } from '../effects/WaterDistortion'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const BUBBLE_COUNT = IS_MOBILE ? 12 : 30
const WAKE_BUBBLE_COUNT = 20

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

const WAKE_DATA = Array.from({ length: WAKE_BUBBLE_COUNT }, () => ({
  spawnTime: -999,
  x: 0, y: 0, z: 0,
  offsetX: 0, offsetY: 0, offsetZ: 0,
  riseSpeed: 0,
  baseScale: 0,
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

function WhaleBubbleWake({ whalePositionRef }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const nextIdx = useRef(0)
  const lastSpawn = useRef(0)
  const bubbles = WAKE_DATA

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const wPos = whalePositionRef.current

    if (t - lastSpawn.current > 0.25) {
      const b = bubbles[nextIdx.current % WAKE_BUBBLE_COUNT]
      b.spawnTime = t
      b.x = wPos.x
      b.y = wPos.y
      b.z = wPos.z
      b.offsetX = (Math.random() - 0.5) * 0.12
      b.offsetY = (Math.random() - 0.5) * 0.08
      b.offsetZ = (Math.random() - 0.5) * 0.12
      b.riseSpeed = Math.random() * 0.1 + 0.05
      b.baseScale = Math.random() * 0.005 + 0.002
      nextIdx.current++
      lastSpawn.current = t
    }

    bubbles.forEach((b, i) => {
      const age = t - b.spawnTime
      const lifetime = 3.0

      if (age > lifetime || age < 0) {
        dummy.scale.setScalar(0)
      } else {
        const life = age / lifetime
        const fadeScale = 1 - life * life
        dummy.position.set(
          b.x + b.offsetX + Math.sin(t * 2 + i) * 0.02,
          b.y + b.offsetY + age * b.riseSpeed,
          b.z + b.offsetZ + Math.cos(t * 1.5 + i) * 0.02
        )
        dummy.scale.setScalar(b.baseScale * fadeScale)
      }

      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, WAKE_BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#CAF0F8" transparent opacity={0.12} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

function Whale({ positionRef }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/whale.glb`)
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    const first = Object.values(actions)[0]
    if (first) first.play()
  }, [actions])

  useMemo(() => {
    const rimColor = new THREE.Color('#CAF0F8')
    const baseColor = new THREE.Color('#0a6ea8')

    scene.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone()
        mat.transparent = true
        mat.opacity = 0.2
        mat.depthWrite = false
        mat.toneMapped = false

        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          mat.color = baseColor.clone()
          mat.emissive = baseColor.clone()
          mat.emissiveIntensity = 0.35
          mat.metalness = 0
          mat.roughness = 1
        }

        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uRimColor = { value: rimColor }
          shader.uniforms.uRimPower = { value: 2.0 }
          shader.uniforms.uRimIntensity = { value: 0.8 }

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
            gl_FragColor.a = max(gl_FragColor.a, fresnelTerm * uRimIntensity);`
          )
        }

        mat.customProgramCacheKey = () => 'whale-fresnel'
        mat.needsUpdate = true
        child.material = mat
      }
    })
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    // Figure-8 in the x-z plane: z at 2x frequency ensures the whale
    // sweeps through a broad arc at each edge instead of snapping heading
    const x = Math.sin(t * 0.08) * 3.2 + Math.sin(t * 0.19) * 0.3
    const y = -0.3 + Math.sin(t * 0.11) * 0.7 + Math.sin(t * 0.27) * 0.12
    const z = Math.sin(t * 0.16) * 0.6 + Math.sin(t * 0.14) * 0.15
    groupRef.current.position.set(x, y, z)

    const vx = Math.cos(t * 0.08) * 0.256 + Math.cos(t * 0.19) * 0.057
    const vy = Math.cos(t * 0.11) * 0.077 + Math.cos(t * 0.27) * 0.0324
    const vz = Math.cos(t * 0.16) * 0.096 + Math.cos(t * 0.14) * 0.021
    const hSpeed = Math.sqrt(vx * vx + vz * vz)

    const targetY = Math.atan2(-vz, vx) - Math.PI / 2
    let deltaY = targetY - groupRef.current.rotation.y
    if (deltaY > Math.PI) deltaY -= Math.PI * 2
    if (deltaY < -Math.PI) deltaY += Math.PI * 2
    groupRef.current.rotation.y += deltaY * 0.05
    groupRef.current.rotation.x = Math.atan2(vy, hSpeed) * 0.4
    groupRef.current.rotation.z = -vx * 0.05

    const breathe = 1 + Math.sin(t * 0.4) * 0.02
    groupRef.current.scale.setScalar(0.6 * breathe)

    if (positionRef) positionRef.current.set(x, y, z)
  })

  return (
    <group ref={groupRef} scale={0.6}>
      <primitive object={scene} />
      <pointLight color="#CAF0F8" intensity={0.4} distance={6} decay={2} />
    </group>
  )
}

export default function HeroCaustics() {
  const whalePositionRef = useRef(new THREE.Vector3())

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
        {!IS_MOBILE && (
          <>
            <Whale positionRef={whalePositionRef} />
            <WhaleBubbleWake whalePositionRef={whalePositionRef} />
          </>
        )}
        <EffectComposer multisampling={0}>
          {!IS_MOBILE && <WaterDistortion strength={0.004} speed={1.0} />}
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.4} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
