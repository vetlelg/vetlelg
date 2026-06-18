import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uScrollFade;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }

  float ray(vec2 uv, float center, float width, float baseTilt, float speed, float seed) {
    float tilt = baseTilt + sin(uTime * speed * 0.4 + seed) * 0.04;
    float x = uv.x + uv.y * tilt;

    x += sin(uTime * speed + seed) * 0.06;
    x += sin(uTime * speed * 0.5 + seed * 1.7) * 0.04;
    x += sin(uTime * speed * 0.25 + seed * 2.3) * 0.02;

    float d = abs(x - center);
    d += noise(uv.y * 4.0 + uTime * 0.1 + seed) * 0.008;

    float w = width * (1.0 + sin(uTime * speed * 0.3 + seed * 1.5) * 0.15);
    float intensity = exp(-d * d / (w * w * 0.35));

    intensity *= smoothstep(0.0, 0.5, uv.y);
    intensity *= 0.8 + noise(uv.y * 2.0 + uTime * 0.08 + seed * 3.0) * 0.2;

    return intensity;
  }

  void main() {
    vec2 uv = vec2(vUv.x * uAspect, vUv.y);
    float cx = uAspect * 0.5;

    float rays = 0.0;
    rays += ray(uv, cx - 0.50, 0.14, 0.18, 0.10, 0.0) * 0.80;
    rays += ray(uv, cx - 0.15, 0.09, 0.14, 0.08, 2.1) * 0.65;
    rays += ray(uv, cx + 0.12, 0.18, 0.20, 0.06, 4.3) * 0.75;
    rays += ray(uv, cx + 0.38, 0.07, 0.12, 0.12, 1.5) * 0.50;
    rays += ray(uv, cx + 0.58, 0.12, 0.16, 0.09, 3.7) * 0.60;
    rays += ray(uv, cx - 0.32, 0.10, 0.22, 0.11, 5.2) * 0.55;
    rays += ray(uv, cx + 0.78, 0.15, 0.15, 0.07, 6.8) * 0.45;

    rays *= 0.92 + sin(uTime * 0.25) * 0.08;
    rays *= uScrollFade;

    vec3 color = vec3(0.792, 0.941, 0.973);
    gl_FragColor = vec4(color, rays * 0.38);
  }
`

function RaysMesh() {
  const materialRef = useRef()
  const scrollFade = useRef(1.0)
  const { size } = useThree()
  const set = useThree((s) => s.set)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollFade: { value: 1.0 },
    uAspect: { value: 1.0 },
  }), [])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uAspect.value = size.width / size.height
    }
  }, [size])

  useEffect(() => {
    function computeFade(p) {
      return p < 0.15 ? 1.0 : Math.max(0, 1.0 - ((p - 0.15) / 0.85) ** 0.6)
    }

    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => {
        const el = document.getElementById('experience')
        if (!el) return window.innerHeight * 2
        return el.offsetTop + el.offsetHeight
      },
      onUpdate: (self) => {
        const prev = scrollFade.current
        const next = computeFade(self.progress)
        scrollFade.current = next
        if (prev < 0.001 && next >= 0.001) set({ frameloop: 'always' })
      },
    })
    scrollFade.current = computeFade(trigger.progress)
    return () => trigger.kill()
  }, [set])

  useFrame((state) => {
    const mat = materialRef.current
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uScrollFade.value = scrollFade.current
    if (scrollFade.current < 0.001) set({ frameloop: 'never' })
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function GodRays() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 1] }}
      dpr={IS_MOBILE ? 1 : [1, 1.5]}
      gl={{ alpha: true, antialias: false }}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <RaysMesh />
    </Canvas>
  )
}
