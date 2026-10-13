import { Color, ShaderMaterial } from "three"

import { PALETTE } from "./globe-materials"

const arcVertex = `
  attribute float aKind;
  attribute float aSeed;
  varying float vT;
  varying float vKind;
  varying float vSeed;
  void main() {
    vT = uv.x;
    vKind = aKind;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const arcFragment = `
  uniform float uDraw;
  uniform float uRevenue;
  uniform float uTime;
  uniform vec3 uBlue;
  uniform vec3 uAmber;
  varying float vT;
  varying float vKind;
  varying float vSeed;
  void main() {
    float reach = clamp(uDraw * 1.6 - vSeed * 0.6, 0.0, 1.0);
    if (vT > reach) discard;
    float flow = 0.6 + 0.4 * smoothstep(0.0, 1.0, fract(vT * 1.4 - uTime * 0.16 + vSeed));
    float buyer = step(0.5, vKind);
    float alpha = mix(0.55 * (1.0 - 0.78 * uRevenue), 0.75 + 0.25 * uRevenue, buyer);
    alpha *= flow * smoothstep(0.0, 0.04, vT);
    gl_FragColor = vec4(mix(uBlue, uAmber, buyer), alpha);
    #include <colorspace_fragment>
  }
`

const pulseVertex = `
  attribute float aKind;
  attribute float aT;
  uniform float uSize;
  varying float vKind;
  varying float vT;
  void main() {
    vKind = aKind;
    vT = aT;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (1.0 + aKind * 0.6) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const pulseFragment = `
  uniform float uOpacity;
  uniform float uRevenue;
  uniform vec3 uBlue;
  uniform vec3 uAmber;
  varying float vKind;
  varying float vT;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.22, 0.12, d);
    float halo = smoothstep(0.5, 0.15, d) * 0.35;
    float buyer = step(0.5, vKind);
    float dim = mix(1.0 - 0.75 * uRevenue, 1.0, buyer);
    float ends = sin(3.14159 * clamp(vT, 0.0, 1.0));
    float alpha = (core + halo) * dim * uOpacity * sqrt(ends);
    gl_FragColor = vec4(mix(uBlue, uAmber, buyer), alpha);
    #include <colorspace_fragment>
  }
`

const shared = () => ({
  uRevenue: { value: 0 },
  uBlue: { value: new Color(PALETTE.blue) },
  uAmber: { value: new Color(PALETTE.amber) },
})

export const createArcMaterial = () =>
  new ShaderMaterial({
    vertexShader: arcVertex,
    fragmentShader: arcFragment,
    uniforms: { ...shared(), uDraw: { value: 0 }, uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
  })

export const createPulseMaterial = (size: number) =>
  new ShaderMaterial({
    vertexShader: pulseVertex,
    fragmentShader: pulseFragment,
    uniforms: { ...shared(), uSize: { value: size }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
  })
