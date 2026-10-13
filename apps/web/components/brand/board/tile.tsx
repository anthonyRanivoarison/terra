import { cn } from "@workspace/ui/lib/utils"

type TileType = {
  index: number
  label: string
  className?: string
  labelClassName?: string
  children: React.ReactNode
}

export const Tile = ({
  index,
  label,
  className,
  labelClassName,
  children,
}: TileType) => (
  <section
    aria-label={label}
    className={cn(
      "relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-3xl p-6 sm:aspect-square sm:min-h-0 sm:p-8",
      className
    )}
  >
    <header
      className={cn(
        "flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase opacity-60",
        labelClassName
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
    </header>
    <div className="relative flex flex-1 flex-col">{children}</div>
  </section>
)
