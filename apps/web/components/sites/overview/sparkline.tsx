type SparklineType = { values: number[]; label: string }

const W = 280
const H = 64

export const Sparkline = ({ values, label }: SparklineType) => {
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? W / (values.length - 1) : W
  const points = values.map(
    (v, i) => [i * step, H - 4 - (v / max) * (H - 10)] as const
  )
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${W} ${H} L0 ${H} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="h-16 w-full overflow-visible text-primary"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {last && <circle cx={last[0]} cy={last[1]} r="3" fill="currentColor" />}
    </svg>
  )
}
