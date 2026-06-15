import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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

  void main() {
    float c = 0.0;
    c += causticLayer(vUv, 4.0, 0.12, 0.0);
    c += causticLayer(vUv, 6.0, 0.09, 2.5);
    c += causticLayer(vUv, 8.0, 0.07, 5.0);
    c /= 3.0;

    float brightness = exp(-c * 5.0);

    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * 2.0;
    vignette = clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(uAccent, brightness * vignette * 0.25);
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
      />
    </mesh>
  )
}

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

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
      </Canvas>
    </Suspense>
  )
}
