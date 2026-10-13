import { ARCS, CHANNELS, CRAWLERS, channelName } from "./data"
import { labelNodes } from "./rig"

const register = (key: string) => (node: HTMLElement | null) => {
  labelNodes[key] = node
}

const labels = [
  ...CHANNELS.map((channel) => ({
    key: `channel:${channel.id}`,
    text: channel.name,
    tone: "channel",
  })),
  ...ARCS.flatMap((arc, index) =>
    arc.amount === undefined
      ? []
      : [
          {
            key: `revenue:${index}`,
            text: `${channelName(arc.channel)} +$${arc.amount}`,
            tone: "revenue",
          },
        ]
  ),
  ...CRAWLERS.map((crawler) => ({
    key: `crawler:${crawler.id}`,
    text: crawler.name,
    tone: "crawler",
  })),
]

export const SceneLabels = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {labels.map((label) => (
      <span
        key={label.key}
        ref={register(label.key)}
        data-tone={label.tone}
        className="landing-label"
        style={{ opacity: 0 }}
      >
        {label.text}
      </span>
    ))}
  </div>
)
