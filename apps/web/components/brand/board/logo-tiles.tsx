import { Logo } from "@/components/brand/logo"
import { ORBIT } from "@/components/brand/logo-paths"
import { Tile } from "@/components/brand/board/tile"

export const CoverTile = () => (
  <Tile index={1} label="Terra" className="bg-[#0E1512] text-[#F4F6F1]">
    <div className="flex flex-1 items-center justify-center">
      <Logo className="text-6xl sm:text-7xl" markClassName="text-[#9BE15D]" />
    </div>
    <p className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70">
      Brand guidelines · 2026
    </p>
  </Tile>
)

const CENTER = { x: 128, y: 130 }
const GRID = Array.from({ length: 17 }, (_, i) => i * 16)
const AXIS = 132
const DIR = { x: Math.cos(Math.PI / 6), y: -Math.sin(Math.PI / 6) }

const Guides = () => (
  <g fill="none" strokeWidth={0.8} strokeLinecap="round">
    {GRID.map((v) => (
      <g key={v} className="stroke-[#0E1512]/10">
        <line x1={v} x2={v} y1={0} y2={256} />
        <line y1={v} y2={v} x1={0} x2={256} />
      </g>
    ))}
    <g className="stroke-[#1F6B3A]" strokeDasharray="3 3">
      <circle cx={CENTER.x} cy={CENTER.y} r={60} />
      <line
        x1={CENTER.x - AXIS * DIR.x}
        y1={CENTER.y - AXIS * DIR.y}
        x2={CENTER.x + AXIS * DIR.x}
        y2={CENTER.y + AXIS * DIR.y}
      />
      <line x1={CENTER.x} y1={CENTER.y} x2={CENTER.x + AXIS} y2={CENTER.y} />
    </g>
    <circle cx={CENTER.x} cy={CENTER.y} r={2.5} className="fill-[#1F6B3A]" />
    <path
      d={`M${CENTER.x + 40} ${CENTER.y} A 40 40 0 0 0 ${CENTER.x + 40 * DIR.x} ${CENTER.y + 40 * DIR.y}`}
      className="stroke-[#1F6B3A]"
    />
  </g>
)

export const ConstructionTile = () => (
  <Tile index={2} label="Construction" className="bg-[#F4F6F1] text-[#0E1512]">
    <div className="relative mx-auto my-auto w-full max-w-[18rem] py-4">
      <svg viewBox="0 0 256 256" className="w-full overflow-visible">
        <Guides />
        <g fill="currentColor" fillOpacity={0.92}>
          {ORBIT.paths.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
      <span className="absolute top-[52%] left-[72%] font-mono text-[10px] text-[#1F6B3A]">
        30°
      </span>
      <span className="absolute top-[22%] left-[30%] font-mono text-[10px] text-[#1F6B3A]">
        r = 60u
      </span>
    </div>
    <dl className="grid grid-cols-3 gap-3 font-mono text-[10px] tracking-wide uppercase">
      {[
        ["Grid", "16u"],
        ["Stroke", "18u"],
        ["Angle", "30°"],
      ].map(([k, v]) => (
        <div key={k} className="border-t border-current/15 pt-2">
          <dt className="opacity-50">{k}</dt>
          <dd className="mt-0.5 text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  </Tile>
)
