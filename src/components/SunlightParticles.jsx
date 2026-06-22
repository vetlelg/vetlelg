import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { WaterDistortion } from '../effects/WaterDistortion'
import FrameloopControl from './FrameloopControl'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const PARTICLE_COUNT = IS_MOBILE ? 25 : 60
const CA_OFFSET = new THREE.Vector2(0.0006, 0.0003)

const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, () => ({
  x: (Math.random() - 0.5) * 14,
  y: (Math.random() - 0.5) * 8,
  z: (Math.random() - 0.5) * 4,
  speedX: (Math.random() - 0.5) * 0.08,
  speedY: Math.random() * 0.04 + 0.01,
  scale: Math.random() * 0.03 + 0.01,
  phase: Math.random() * Math.PI * 2,
}))

function Particles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = PARTICLE_DATA

  useFrame((state) => {
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      const x = p.x + Math.sin(t * 0.3 + p.phase) * 0.5
      const y = p.y + Math.sin(t * p.speedY + p.phase) * 0.8
      const z = p.z + Math.cos(t * 0.2 + p.phase) * 0.3
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 0.5 + p.phase) * 0.3))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#90E0EF" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  )
}

function FishSchool() {
  const groupRef = useRef()
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/fishschool.glb`)
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    const first = Object.values(actions)[0]
    if (first) {
      first.timeScale = 0.6
      first.play()
    }
  }, [actions])

  useMemo(() => {
    const baseColor = new THREE.Color('#0a6ea8')
    const rimColor = new THREE.Color('#90E0EF')

    scene.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material.clone()
        mat.transparent = true
        mat.opacity = 0.25
        mat.depthWrite = false
        mat.toneMapped = false

        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
          mat.color = baseColor.clone()
          mat.emissive = baseColor.clone()
          mat.emissiveIntensity = 0.4
          mat.metalness = 0
          mat.roughness = 1
        }

        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uRimColor = { value: rimColor }
          shader.uniforms.uRimPower = { value: 2.0 }
          shader.uniforms.uRimIntensity = { value: 0.9 }

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

        mat.customProgramCacheKey = () => 'fish-fresnel'
        mat.needsUpdate = true
        child.material = mat
      }
    })
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const x = Math.sin(t * 0.06) * 2.5 + Math.sin(t * 0.15) * 0.4
    const y = Math.sin(t * 0.09) * 0.8 + Math.sin(t * 0.22) * 0.15
    const z = Math.sin(t * 0.12) * 0.5
    groupRef.current.position.set(x, y, z)

    const vx = Math.cos(t * 0.06) * 0.15 + Math.cos(t * 0.15) * 0.06
    const vy = Math.cos(t * 0.09) * 0.072 + Math.cos(t * 0.22) * 0.033
    const targetY = Math.atan2(-vx, 1) * 0.3
    let deltaY = targetY - groupRef.current.rotation.y
    if (deltaY > Math.PI) deltaY -= Math.PI * 2
    if (deltaY < -Math.PI) deltaY += Math.PI * 2
    groupRef.current.rotation.y += deltaY * 0.03
    groupRef.current.rotation.z = vy * 0.15
  })

  return (
    <group ref={groupRef} scale={5}>
      <primitive object={scene} />
      <pointLight color="#90E0EF" intensity={0.3} distance={8} decay={2} />
    </group>
  )
}

export default function SunlightParticles() {
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
        <FrameloopControl sectionId="experience" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[0, 5, 3]} intensity={0.5} color="#90E0EF" />
        <Particles />
        {!IS_MOBILE && <FishSchool />}
        <EffectComposer multisampling={0}>
          {!IS_MOBILE && <WaterDistortion strength={0.003} speed={0.8} />}
          <Bloom mipmapBlur intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.3} />
          {!IS_MOBILE && <ChromaticAberration offset={CA_OFFSET} />}
          <Vignette darkness={0.25} offset={0.6} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
