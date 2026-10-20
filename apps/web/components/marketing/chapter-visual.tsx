import { AiVisual } from "./visuals/ai"
import { LiveVisual } from "./visuals/live"
import { RevenueVisual } from "./visuals/revenue"
import { TrafficVisual } from "./visuals/traffic"

const VISUALS: Record<string, () => React.ReactNode> = {
  traffic: TrafficVisual,
  revenue: RevenueVisual,
  live: LiveVisual,
  ai: AiVisual,
}

type ChapterVisualType = { id: string }

export const ChapterVisual = ({ id }: ChapterVisualType) => {
  const Visual = VISUALS[id]
  return Visual ? <Visual /> : null
}
