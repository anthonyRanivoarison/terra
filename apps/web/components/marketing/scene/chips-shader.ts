export const CHIP_VERTEX = `
attribute float aIcon;
attribute float aGold;
attribute float aFade;
uniform float uSize;
varying float vIcon;
varying float vGold;
varying float vFade;

void main() {
  vIcon = aIcon;
  vGold = aGold;
  vFade = aFade;
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * (0.75 + 0.25 * aFade);
}
`

export const CHIP_FRAGMENT = `
uniform sampler2D uAtlas;
uniform float uGrid;
uniform float uOpacity;
uniform vec3 uGoldColor;
varying float vIcon;
varying float vGold;
varying float vFade;

void main() {
  vec2 pc = gl_PointCoord;
  float d = length(pc - 0.5);
  if (d > 0.5) discard;
  float col = mod(vIcon, uGrid);
  float row = floor(vIcon / uGrid);
  vec2 uv = vec2((col + pc.x) / uGrid, 1.0 - (row + pc.y) / uGrid);
  vec4 tex = texture2D(uAtlas, uv);
  float ring = smoothstep(0.36, 0.4, d) * (1.0 - smoothstep(0.41, 0.44, d));
  vec3 color = mix(tex.rgb, uGoldColor, ring * vGold);
  float alpha = max(tex.a, ring * vGold) * uOpacity * vFade;
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`
