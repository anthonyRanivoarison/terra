import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { PulseIcon } from "@phosphor-icons/react/ssr"
import type { Realtime } from "@/lib/analytics/realtime"
import { NoData } from "../no-data"

type MinuteBarsType = { minutes: Realtime["minutes"] }

export const MinuteBars = ({ minutes }: MinuteBarsType) => {
  const max = Math.max(1, ...minutes.map((m) => m.views))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Views per minute</CardTitle>
      </CardHeader>
      <CardContent>
        {!minutes.some((m) => m.views > 0) ? (
          <NoData
            icon={PulseIcon}
            title="No views in the last 30 minutes"
            className="min-h-36"
          />
        ) : (
          <>
            <div
              className="flex h-28 items-end gap-1"
              role="img"
              aria-label="Views per minute over the last 30 minutes"
            >
              {minutes.map((m) => (
                <div
                  key={m.minute}
                  title={`${new Date(m.minute).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${m.views} views`}
                  className="flex-1 rounded-t-sm bg-primary transition-[height] duration-500 ease-out"
                  style={{
                    height: `${Math.max((m.views / max) * 100, m.views ? 4 : 1)}%`,
                    opacity: m.views ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>30 min ago</span>
              <span>now</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
