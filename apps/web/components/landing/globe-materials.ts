import { BackSide, Color, NormalBlending, ShaderMaterial, Vector3 } from "three"

export const LIGHT = new Vector3(-0.6, 0.7, 0.9).normalize()

export const PALETTE = {
  porcelain: "#f6f8fc",
  shade: "#d6deee",
  blue: "#2563eb",
  sky: "#7dd3fc",
  navy: "#0b1b3f",
  amber: "#f59e0b",
}

const surfaceVertex = `
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPositionW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const sphereFragment = `
  uniform vec3 uLight;
  uniform vec3 uBase;
  uniform vec3 uShade;
  uniform vec3 uRim;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPositionW);
    float lambert = dot(n, uLight) * 0.5 + 0.5;
    vec3 color = mix(uShade, uBase, smoothstep(0.05, 0.95, lambert));
    float spec = pow(max(dot(n, normalize(uLight + v)), 0.0), 36.0);
    color += vec3(1.0) * spec * 0.18;
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    color = mix(color, uRim, fresnel * 0.32);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

const atmosphereFragment = `
  uniform vec3 uColor;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPositionW);
    float d = abs(dot(n, v));
    float glow = pow(clamp(d / 0.5, 0.0, 1.0), 2.4);
    gl_FragColor = vec4(uColor, glow * 0.22);
    #include <colorspace_fragment>
  }
`

const dotsVertex = `
  uniform float uSize;
  varying float vFacing;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 normalW = normalize(mat3(modelMatrix) * position);
    vFacing = dot(normalW, normalize(cameraPosition - world.xyz));
    vec4 mv = viewMatrix * world;
    gl_PointSize = uSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const dotsFragment = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, d);
    float facing = smoothstep(-0.02, 0.4, vFacing);
    gl_FragColor = vec4(uColor, edge * facing * uOpacity * (0.45 + 0.4 * vFacing));
    #include <colorspace_fragment>
  }
`

export const createSphereMaterial = () =>
  new ShaderMaterial({
    vertexShader: surfaceVertex,
    fragmentShader: sphereFragment,
    uniforms: {
      uLight: { value: LIGHT },
      uBase: { value: new Color(PALETTE.porcelain) },
      uShade: { value: new Color(PALETTE.shade) },
      uRim: { value: new Color(PALETTE.blue) },
    },
  })

export const createAtmosphereMaterial = () =>
  new ShaderMaterial({
    vertexShader: surfaceVertex,
    fragmentShader: atmosphereFragment,
    uniforms: { uColor: { value: new Color(PALETTE.blue) } },
    side: BackSide,
    blending: NormalBlending,
    transparent: true,
    depthWrite: false,
  })

export const createDotsMaterial = (size: number) =>
  new ShaderMaterial({
    vertexShader: dotsVertex,
    fragmentShader: dotsFragment,
    uniforms: {
      uSize: { value: size },
      uColor: { value: new Color(PALETTE.blue) },
      uOpacity: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
  })
