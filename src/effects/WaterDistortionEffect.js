import { Effect } from 'postprocessing'
import { Uniform } from 'three'

const fragmentShader = /* glsl */ `
uniform float uStrength;
uniform float uSpeed;

void mainUv(inout vec2 uv) {
  float t = time * uSpeed;

  float distX = sin(uv.y * 7.3 + t * 0.5) * uStrength;
  distX += sin(uv.y * 12.0 + t * 0.35 + 1.7) * uStrength * 0.5;

  float distY = cos(uv.x * 5.5 + t * 0.4) * uStrength * 0.5;
  distY += cos(uv.x * 9.3 + t * 0.25 + 0.9) * uStrength * 0.25;

  uv += vec2(distX, distY);
}
`

export class WaterDistortionEffect extends Effect {
  constructor({ strength = 0.003, speed = 0.8 } = {}) {
    super('WaterDistortion', fragmentShader, {
      uniforms: new Map([
        ['uStrength', new Uniform(strength)],
        ['uSpeed', new Uniform(speed)],
      ]),
    })
  }
}
