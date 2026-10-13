import { Color, ShaderMaterial } from "three"

const vertex = (points: boolean) => `
  attribute float aAlpha;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    ${points ? "gl_PointSize = uSize * (0.35 + 0.65 * aAlpha) / -mv.z;" : ""}
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = (points: boolean) => `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float shape = 1.0;
    ${points ? "float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; shape = smoothstep(0.5, 0.3, d);" : ""}
    gl_FragColor = vec4(uColor, vAlpha * uOpacity * shape);
    #include <colorspace_fragment>
  }
`

export const createFadeMaterial = (color: string, points: boolean, size = 0) =>
  new ShaderMaterial({
    vertexShader: vertex(points),
    fragmentShader: fragment(points),
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: 0 },
      uSize: { value: size },
    },
    transparent: true,
    depthWrite: false,
  })
