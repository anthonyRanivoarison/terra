import { cn } from "@workspace/ui/lib/utils"
import { loadGlobe } from "@/lib/geo/globe"
import { LABEL_SIZE, type Box, type Label } from "@/lib/geo/labels"
import type { Projection } from "@/lib/geo/orthographic"

const WIDTH = 1920
const TOP = 220
const HEIGHT = 1160
const R = 1600
const CX = WIDTH / 2
const CY = TOP + R

const PROJECTION: Projection = {
  center: [CX, CY],
  radius: R,
  rotate: [29, -27],
  minStep: 2,
}

const VIEW: Box = [16, TOP, WIDTH - 16, HEIGHT - 40]

const PALETTE =
  "[--globe-hi:#f1f4f8] [--globe-ocean:#e9edf3] [--globe-deep:#dde2ea] [--globe-land:rgb(255_255_255/0.45)] [--globe-line:#c3cad6] [--globe-label:#7c8698] [--globe-glow:rgb(91_106_224/0.4)] dark:[--globe-hi:#2a2b30] dark:[--globe-ocean:#222327] dark:[--globe-deep:#1b1b1d] dark:[--globe-land:rgb(255_255_255/0.06)] dark:[--globe-line:#3a3b42] dark:[--globe-label:#8b8d96] dark:[--globe-glow:rgb(165_176_246/0.35)]"

const FRAME =
  "[--globe-w:max(100vw,1100px)] [--globe-y:62svh] sm:[--globe-y:53svh]"

const stop = (offset: number, color: string, opacity = 1) => (
  <stop
    offset={offset}
    style={{ stopColor: `var(--globe-${color})`, stopOpacity: opacity }}
  />
)

const KIND = {
  land: { fontWeight: 500, opacity: 0.9 },
  city: { fontWeight: 400, opacity: 0.75 },
  sea: { fontWeight: 400, opacity: 0.6, fontStyle: "italic" },
} as const

const Text = ({ lines, x, y, kind }: Label) => {
  const size = LABEL_SIZE[kind]
  const lead = size * 1.15
  return (
    <text
      x={x}
      y={y - ((lines.length - 1) * lead) / 2}
      fontSize={size}
      letterSpacing={kind === "sea" ? "0.12em" : undefined}
      {...KIND[kind]}
    >
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : lead}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

type GlobeBackdropType = { className?: string }

export const GlobeBackdrop = ({ className }: GlobeBackdropType) => {
  const { land, labels } = loadGlobe(PROJECTION, VIEW)
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        PALETTE,
        FRAME,
        className
      )}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          top: `calc(var(--globe-y) - var(--globe-w) * ${TOP / WIDTH})`,
          maskImage: "linear-gradient(to bottom, black 80%, transparent)",
        }}
        className="absolute left-1/2 w-(--globe-w) max-w-none -translate-x-1/2 font-sans"
      >
        <defs>
          <radialGradient
            id="globe-shade"
            gradientUnits="userSpaceOnUse"
            cx={CX}
            cy={TOP + 120}
            r={1250}
          >
            {stop(0, "hi")}
            {stop(0.45, "ocean")}
            {stop(1, "deep")}
          </radialGradient>
          <radialGradient
            id="globe-halo"
            gradientUnits="userSpaceOnUse"
            cx={CX}
            cy={CY}
            r={R + 260}
          >
            {stop(R / (R + 260) - 0.002, "glow", 0.32)}
            {stop((R + 70) / (R + 260), "glow", 0.12)}
            {stop(1, "glow", 0)}
          </radialGradient>
          <linearGradient id="globe-sides" x1="0" x2="1" y1="0" y2="0">
            <stop offset={0} stopColor="white" />
            <stop offset={0.3} stopColor="white" stopOpacity={0.25} />
            <stop offset={0.5} stopColor="white" stopOpacity={0.05} />
            <stop offset={0.7} stopColor="white" stopOpacity={0.25} />
            <stop offset={1} stopColor="white" />
          </linearGradient>
          <mask id="globe-sides-mask">
            <rect width={WIDTH} height={HEIGHT} fill="url(#globe-sides)" />
          </mask>
        </defs>
        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="url(#globe-halo)"
          mask="url(#globe-sides-mask)"
        />
        <circle cx={CX} cy={CY} r={R} fill="url(#globe-shade)" />
        <path
          d={land}
          fill="var(--globe-land)"
          stroke="var(--globe-line)"
          strokeWidth={1}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--globe-glow)"
          strokeOpacity={0.35}
          strokeWidth={1}
          mask="url(#globe-sides-mask)"
          vectorEffect="non-scaling-stroke"
        />
        <g
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--globe-label)"
        >
          {labels.map((label) => (
            <Text key={label.lines.join(" ")} {...label} />
          ))}
        </g>
      </svg>
    </div>
  )
}
