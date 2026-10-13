import { Logo, LOGO_CIRCLE, LOGO_DOT, LOGO_LINE } from "@/components/brand/logo"
import { Tile } from "@/components/brand/board/tile"

export const CoverTile = () => (
  <Tile index={1} label="Terra" className="bg-[#2563EB] text-white">
    <div className="flex flex-1 items-center justify-center">
      <Logo className="text-6xl sm:text-7xl" />
    </div>
    <p className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70">
      Brand guidelines · 2026
    </p>
  </Tile>
)

const GRID = Array.from({ length: 13 }, (_, i) => i * 2)

const Guides = () => (
  <g fill="none" strokeWidth={0.06} strokeLinecap="round">
    {GRID.map((v) => (
      <g key={v} className="stroke-[#0B1B3F]/10">
        <line x1={v} x2={v} y1={0} y2={24} />
        <line y1={v} y2={v} x1={0} x2={24} />
      </g>
    ))}
    <g className="stroke-[#2563EB]" strokeDasharray="0.35 0.35">
      <rect x={2} y={6} width={16} height={16} />
      <line x1={12.5} y1={16} x2={23} y2={5.5} />
      <line x1={12.5} y1={16} x2={22} y2={16} />
      <line x1={10} y1={14} x2={2} y2={14} />
    </g>
    <circle cx={10} cy={14} r={0.35} className="fill-[#2563EB]" />
    <path
      d="M15.5 16 A 3 3 0 0 0 14.6 13.9"
      className="stroke-[#2563EB]"
      strokeWidth={0.1}
    />
  </g>
)

export const ConstructionTile = () => (
  <Tile index={2} label="Construction" className="text-[#0A0A0B]] bg-[#F7F8FA]">
    <div className="relative mx-auto my-auto w-full max-w-[18rem] py-4">
      <svg viewBox="0 0 24 24" className="w-full overflow-visible">
        <Guides />
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.92}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle {...LOGO_CIRCLE} />
          <path d={LOGO_LINE} />
          <circle {...LOGO_DOT} fill="currentColor" stroke="none" />
        </g>
      </svg>
      <span className="absolute top-[49%] left-[13%] font-mono text-[10px] text-[#2563EB]">
        r = 8u
      </span>
      <span className="absolute top-[57%] left-[69%] font-mono text-[10px] text-[#2563EB]">
        45°
      </span>
    </div>
    <dl className="grid grid-cols-3 gap-3 font-mono text-[10px] tracking-wide uppercase">
      {[
        ["Grid", "24u"],
        ["Stroke", "2u"],
        ["Angle", "45°"],
      ].map(([k, v]) => (
        <div key={k} className="border-t border-current/15 pt-2">
          <dt className="opacity-50">{k}</dt>
          <dd className="mt-0.5 text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  </Tile>
)
