const STEP = 4
const R = 44
const LIGHT = { x: -0.5, y: -0.55, z: 0.67 }

const dots = (() => {
  const out: { x: number; y: number; r: number; o: number }[] = []
  for (let y = -R; y <= R; y += STEP) {
    for (let x = -R; x <= R; x += STEP) {
      const d2 = x * x + y * y
      if (d2 > R * R) continue
      const z = Math.sqrt(R * R - d2) / R
      const shade = Math.max(
        0,
        (x / R) * LIGHT.x + (y / R) * LIGHT.y + z * LIGHT.z
      )
      const band = Math.sin((x + y * 0.6) / 9) * Math.cos(y / 11) > 0.1
      const r = 0.45 + shade * (band ? 1.5 : 0.65)
      out.push({
        x: x + 50,
        y: y + 50,
        r: Math.round(r * 100) / 100,
        o: band ? 1 : 0.4,
      })
    }
  }
  return out
})()

const PINGS = [
  [36, 34],
  [58, 46],
  [44, 64],
  [70, 30],
]

export const HalftoneGlobe = () => (
  <svg viewBox="0 0 100 100" className="w-full overflow-visible" aria-hidden>
    <defs>
      <radialGradient id="terra-glow" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#2563EB" stopOpacity="0.55" />
        <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="58" fill="url(#terra-glow)" />
    {dots.map(({ x, y, r, o }) => (
      <circle
        key={`${x}-${y}`}
        cx={x}
        cy={y}
        r={r}
        fill="#7DD3FC"
        opacity={o}
      />
    ))}
    {PINGS.map(([x, y]) => (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r="4" fill="#7DD3FC" opacity="0.15" />
        <circle cx={x} cy={y} r="1.6" fill="#FFFFFF" />
      </g>
    ))}
    <path
      d="M22 64 38 50 52 62 96 18"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="96" cy="18" r="2.6" fill="#FFFFFF" />
  </svg>
)
