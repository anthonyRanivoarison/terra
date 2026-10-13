import { swatches, taglines } from "@/components/brand/palette"
import { Tile } from "@/components/brand/board/tile"

export const EssenceTile = () => (
  <Tile index={4} label="Essence" className="bg-[#0A0A0B] text-white">
    <p className="mt-auto font-heading text-4xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-5xl">
      Know where your <span className="text-[#7DD3FC]">revenue</span> comes
      from.
    </p>
    <p className="mt-6 text-sm text-white/50">{taglines.secondary}</p>
  </Tile>
)

export const ColorsTile = () => (
  <Tile index={5} label="Color" className="text-[#0A0A0B]] bg-white">
    <div className="mt-6 grid flex-1 grid-cols-3 grid-rows-3 gap-2">
      {swatches.map(({ name, hex }, i) => (
        <div
          key={hex}
          style={{ background: hex }}
          className={`flex flex-col justify-end rounded-xl p-3 ring-1 ring-black/5 ${
            i === 0 ? "col-span-2 row-span-2" : ""
          } ${i < 2 || i === 3 ? "text-white" : "text-[#0A0A0B]"}`}
        >
          <span className="text-xs font-medium">{name}</span>
          <span className="font-mono text-[10px] opacity-70">{hex}</span>
        </div>
      ))}
    </div>
  </Tile>
)

export const TypeTile = () => (
  <Tile index={6} label="Typography" className="text-[#0A0A0B]] bg-[#F7F8FA]">
    <div className="mt-auto flex items-end justify-between gap-4">
      <span className="font-heading text-8xl leading-none font-semibold tracking-tighter">
        Aa
      </span>
      <span className="pb-2 text-right font-mono text-[10px] leading-relaxed tracking-wide uppercase opacity-50">
        Bricolage
        <br />
        Grotesque
      </span>
    </div>
    <div className="mt-6 space-y-3 border-t border-current/10 pt-4">
      <p className="flex items-baseline justify-between gap-4 text-sm">
        <span>Where visitors come from, and what they buy.</span>
        <span className="font-mono text-[10px] uppercase opacity-50">
          Geist
        </span>
      </p>
      <p className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-lg tabular-nums">$12,480 · 3,912</span>
        <span className="font-mono text-[10px] uppercase opacity-50">
          Geist Mono
        </span>
      </p>
    </div>
  </Tile>
)
