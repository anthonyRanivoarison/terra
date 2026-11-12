import { Logo, LogoMark } from "@/components/brand/logo"
import { Tile } from "@/components/brand/board/tile"

const SNIPPET: [string, string][] = [
  ["<script", "defer"],
  ["  data-website-id=", '"ws_…"'],
  ["  data-domain=", '"example.com"'],
  ["  src=", '"https://cdn.terra.dev/js/script.js"'],
  ["></script>", ""],
]

export const DigitalTile = () => (
  <Tile index={3} label="Digital" className="bg-[#0B1B3F] text-white">
    <div className="my-auto overflow-hidden rounded-xl bg-[#F7F8FA] text-[#0A0A0B] shadow-2xl ring-1 shadow-black/40 ring-white/10">
      <div className="flex items-center gap-1.5 border-b border-[#E4E7EC] px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-[#E4E7EC]" />
        ))}
        <span className="mx-auto rounded-md bg-white px-6 py-0.5 font-mono text-[10px] text-[#0A0A0B]/60 ring-1 ring-[#E4E7EC]">
          example.com
        </span>
      </div>
      <div className="flex items-center justify-between px-4 pt-3 text-[11px]">
        <Logo className="text-sm" markClassName="text-[#1F6B3A]" />
        <span className="font-mono text-[#0A0A0B]/50">Install</span>
      </div>
      <pre className="m-3 overflow-hidden rounded-lg bg-[#0A0A0B] p-3 font-mono text-[10px] leading-relaxed sm:text-[11px]">
        {SNIPPET.map(([key, value]) => (
          <div key={key} className="truncate">
            <span className="text-[#7DD3FC]">{key}</span>
            {value.startsWith('"') ? (
              <span className="text-[#93B4F8]">{value}</span>
            ) : (
              <span className="text-white/70"> {value}</span>
            )}
          </div>
        ))}
      </pre>
    </div>
  </Tile>
)

export const PhysicalTile = () => (
  <Tile
    index={7}
    label="Physical"
    className="bg-gradient-to-br from-[#7DD3FC] via-[#4A8FF0] to-[#2563EB] text-[#0B1B3F]"
  >
    <div className="relative my-auto h-56">
      <div className="absolute inset-x-6 top-2 h-40 -rotate-6 rounded-2xl bg-[#F7F8FA] p-5 shadow-xl shadow-[#0B1B3F]/25">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] text-[#0A0A0B]/60">
            hello@terra.dev
          </div>
          <LogoMark className="size-7 text-[#1F6B3A]" />
        </div>
      </div>
      <div className="absolute inset-x-10 top-14 h-40 rotate-3 rounded-2xl bg-[#0B1B3F] p-5 text-white shadow-2xl shadow-[#0B1B3F]/40">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <Logo className="text-lg" markClassName="text-[#9BE15D]" />
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase">
              Crew
            </span>
          </div>
          <div>
            <div className="font-heading text-base font-semibold">
              Analytics that pays for itself.
            </div>
            <div className="mt-1 font-mono text-[10px] text-white/50">
              ws_8f2k1q · 47.6°N 2.3°E
            </div>
          </div>
        </div>
      </div>
    </div>
  </Tile>
)
