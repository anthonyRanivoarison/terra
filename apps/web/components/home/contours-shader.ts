export const VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`

export const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float terrain(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p = p * 2.03 + vec2(11.3, 7.9);
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
  float h = terrain(p * 1.7 + vec2(uTime * 0.025, uTime * 0.012));
  h += 0.22 * exp(-dot(p - m, p - m) * 10.0);

  float level = h * 16.0;
  float edge = abs(fract(level) - 0.5);
  float width = fwidth(level);
  float line = 1.0 - smoothstep(width * 0.9, width * 2.0, edge);
  float major = step(4.5, mod(floor(level + 0.5), 5.0));

  vec3 ground = vec3(0.027, 0.035, 0.07);
  vec3 blue = vec3(0.33, 0.5, 1.0);
  vec3 amber = vec3(1.0, 0.72, 0.2);
  float peak = smoothstep(0.52, 0.66, h);
  vec3 ink = mix(blue, amber, peak);
  float strength = line * mix(0.3, 1.0, smoothstep(0.3, 0.7, h));
  strength *= mix(0.6, 1.0, major);

  vec3 color = ground + ink * strength + amber * 0.07 * peak;
  float fade = smoothstep(0.0, 0.45, gl_FragCoord.y / uRes.y);
  outColor = vec4(mix(ground, color, fade), 1.0);
}`
