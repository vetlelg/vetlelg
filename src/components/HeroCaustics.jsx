import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uAccent;
  varying vec2 vUv;

  float causticLayer(vec2 uv, float scale, float speed, float seed) {
    vec2 p = uv * scale;
    p += vec2(
      sin(uTime * speed + seed) * 0.4,
      cos(uTime * speed * 0.7 + seed * 1.3) * 0.4
    );
    p.x += sin(p.y * 0.5 + uTime * 0.2 + seed) * 0.4;
    p.y += cos(p.x * 0.4 + uTime * 0.15 + seed * 0.7) * 0.4;

    float a = abs(sin(p.x));
    float b = abs(sin(p.y * 1.1));
    return min(a, b);
  }

  float godRay(vec2 uv, float angle, float width, float speed, float offset) {
    float s = sin(angle);
    float c = cos(angle);
    float projected = uv.x * c + uv.y * s + offset;
    projected += sin(uTime * speed) * 0.2;
    float ray = smoothstep(width, 0.0, abs(fract(projected) - 0.5));
    return ray * ray;
  }

  void main() {
    float c = 0.0;
    c += causticLayer(vUv, 4.0, 0.12, 0.0);
    c += causticLayer(vUv, 6.0, 0.09, 2.5);
    c += causticLayer(vUv, 8.0, 0.07, 5.0);
    c /= 3.0;

    float brightness = exp(-c * 5.0);

    float rays = 0.0;
    rays += godRay(vUv, 0.35, 0.12, 0.02, 0.0) * 0.5;
    rays += godRay(vUv, 0.55, 0.08, 0.015, 1.7) * 0.35;
    rays += godRay(vUv, 0.25, 0.15, 0.025, 3.2) * 0.25;
    float depthFade = smoothstep(0.0, 0.8, vUv.y);
    rays *= depthFade;

    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * 2.0;
    vignette = clamp(vignette, 0.0, 1.0);

    float finalAlpha = (brightness * 0.18 + rays * 0.08) * vignette;
    gl_FragColor = vec4(uAccent, finalAlpha);
  }
`

function CausticMesh() {
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color('#CAF0F8') },
    }),
    []
  )

  useFrame((state) => {
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh>
      <planeGeometry args={[16, 10]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        toneMapped={false}
      />
    </mesh>
  )
}

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
const BUBBLE_COUNT = IS_MOBILE ? 12 : 30

function Bubbles() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const bubbles = useMemo(() => {
    const arr = []
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 6 - 3,
        z: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.25 + 0.08,
        wobbleSpeed: Math.random() * 1.0 + 0.5,
        wobbleAmp: Math.random() * 0.2 + 0.05,
        scale: Math.random() * 0.012 + 0.003,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

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
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
        }}
      >
        <CausticMesh />
        <Bubbles />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>
    </Suspense>
  )
}
