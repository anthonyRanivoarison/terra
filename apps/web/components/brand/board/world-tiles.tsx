import Claude from "@thesvg/react/claude"
import Google from "@thesvg/react/google"
import Openai from "@thesvg/react/openai"
import Perplexity from "@thesvg/react/perplexity"
import X from "@thesvg/react/x"
import { Sparkles, TrendingUp } from "lucide-react"

import { HalftoneGlobe } from "@/components/brand/board/halftone-globe"
import { Tile } from "@/components/brand/board/tile"

export const ImageryTile = () => (
  <Tile
    index={8}
    label="Imagery"
    className="bg-[radial-gradient(120%_90%_at_20%_0%,#16306B_0%,#0B1B3F_55%,#060E22_100%)] text-white"
  >
    <div className="mx-auto my-auto w-full max-w-[17rem]">
      <HalftoneGlobe />
    </div>
  </Tile>
)

const icon = "size-3.5"

const CHANNELS = [
  {
    name: "Google",
    share: "38%",
    icon: <Google variant="mono" className={icon} aria-hidden />,
  },
  {
    name: "ChatGPT",
    share: "21%",
    icon: <Openai variant="light" className={icon} aria-hidden />,
  },
  {
    name: "Claude",
    share: "12%",
    icon: <Claude variant="mono" className={icon} aria-hidden />,
  },
  {
    name: "Perplexity",
    share: "7%",
    icon: <Perplexity variant="mono" className={icon} aria-hidden />,
  },
  {
    name: "X",
    share: "5%",
    icon: <X variant="mono" className={icon} aria-hidden />,
  },
]

const chip =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1"

export const SystemTile = () => (
  <Tile index={9} label="System" className="text-[#0A0A0B]] bg-white">
    <div className="my-auto space-y-5">
      <div className="flex flex-wrap gap-2">
        <span className={`${chip} bg-[#2563EB] text-white ring-[#2563EB]`}>
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#7DD3FC] motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-[#7DD3FC]" />
          </span>
          Live · 42
        </span>
        <span
          className={`${chip} ring-[#7DD3FC]/60] bg-[#7DD3FC]/20 text-[#0B1B3F]`}
        >
          <Sparkles className="size-3.5" aria-hidden />
          AI answers
        </span>
        <span
          className={`${chip} ring-[#0B1B3F]] bg-[#0B1B3F] font-mono text-white`}
        >
          <TrendingUp className="size-3.5" aria-hidden />
          +24%
        </span>
      </div>
      <ul className="space-y-1.5">
        {CHANNELS.map(({ name, icon, share }) => (
          <li
            key={name}
            className="flex items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2 text-xs ring-1 ring-[#E4E7EC]"
          >
            {icon}
            <span className="font-medium">{name}</span>
            <span className="ml-auto font-mono tabular-nums opacity-60">
              {share}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </Tile>
)
