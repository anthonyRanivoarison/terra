export const EARTH_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPositionW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const EARTH_FRAGMENT = `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpecular;
  uniform vec3 uSun;
  uniform vec3 uRim;
  uniform vec3 uCity;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPositionW);
    float sunDot = dot(n, uSun);
    float dayMix = smoothstep(-0.18, 0.28, sunDot);
    vec3 day = texture2D(uDay, vUv).rgb * (0.06 + max(sunDot, 0.0) * 1.05);
    vec3 night = texture2D(uNight, vUv).rgb * uCity * 2.4;
    vec3 color = mix(night, day, dayMix);
    float water = texture2D(uSpecular, vUv).r;
    vec3 halfDir = normalize(uSun + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 60.0) * water * dayMix;
    color += vec3(0.85, 0.92, 1.0) * spec * 0.8;
    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.2);
    color += uRim * fresnel * (0.18 + 0.9 * smoothstep(-0.3, 0.6, sunDot));
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export const ATMOSPHERE_VERTEX = `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPositionW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const ATMOSPHERE_FRAGMENT = `
  uniform vec3 uSun;
  uniform vec3 uColor;

  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPositionW);
    float d = abs(dot(n, viewDir));
    float glow = pow(clamp(d / 0.42, 0.0, 1.0), 2.2);
    float lit = smoothstep(-0.35, 0.55, dot(n, uSun));
    float alpha = glow * (0.12 + 0.88 * lit);
    gl_FragColor = vec4(uColor * alpha * 1.6, alpha);
    #include <colorspace_fragment>
  }
`
