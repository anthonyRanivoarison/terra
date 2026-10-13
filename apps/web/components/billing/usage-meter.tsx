type UsageMeterType = {
  used: number
  quota: number | null
  over: boolean
  overGrace: boolean
  graceEndsAt: string | null
}

const number = new Intl.NumberFormat("en")

export const UsageMeter = ({
  used,
  quota,
  over,
  overGrace,
  graceEndsAt,
}: UsageMeterType) => {
  const percent = quota ? Math.min(100, (used / quota) * 100) : 0
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">Events this month</span>
        <span className="tabular-nums">
          {number.format(used)}
          {quota !== null && ` / ${number.format(quota)}`}
        </span>
      </div>
      {quota !== null && (
        <div
          role="progressbar"
          aria-label="Events used this month"
          aria-valuemin={0}
          aria-valuemax={quota}
          aria-valuenow={used}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={over ? "h-full bg-destructive" : "h-full bg-primary"}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {over && (
        <p className="text-sm text-destructive">
          {overGrace
            ? "Over the monthly quota. New events are paused until you upgrade or the month resets."
            : `Over the monthly quota. Tracking continues until ${
                graceEndsAt
                  ? new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(graceEndsAt))
                  : "the grace period ends"
              }.`}
        </p>
      )}
    </div>
  )
}
