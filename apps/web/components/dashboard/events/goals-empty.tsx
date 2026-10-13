import Link from "next/link"
import { Plus } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { SamplePreview } from "../empty/sample-preview"

const SAMPLE = [
  { name: "faq_use_ai", count: 15 },
  { name: "signup", count: 14 },
  { name: "checkout_started", count: 11 },
  { name: "newsletter_subscribe", count: 9 },
  { name: "demo_request", count: 6 },
  { name: "pricing_toggle", count: 4 },
  { name: "upgrade_click", count: 3 },
  { name: "docs_search", count: 2 },
]

const VISITORS = 441

const SampleGoals = () => (
  <ul className="flex flex-col gap-1">
    {SAMPLE.map((goal) => (
      <li
        key={goal.name}
        className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sm"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
          style={{ width: `${(goal.count / SAMPLE[0]!.count) * 100}%` }}
        />
        <span className="relative truncate font-mono text-[13px]">
          {goal.name}
        </span>
        <span className="relative font-medium tabular-nums">
          {goal.count}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({((goal.count / VISITORS) * 100).toFixed(2)}%)
          </span>
        </span>
      </li>
    ))}
  </ul>
)

type GoalsEmptyType = { publicId: string }

export const GoalsEmpty = ({ publicId }: GoalsEmptyType) => (
  <SamplePreview sample={<SampleGoals />} className="min-h-0 flex-1 px-4 pb-4">
    <div className="flex max-w-xs flex-col items-center gap-3 rounded-xl border bg-background/95 p-5 text-center shadow-lg">
      <Link
        href={`/sites/${publicId}#goals`}
        className={buttonVariants({ size: "sm" })}
      >
        <Plus aria-hidden />
        Add goals
      </Link>
      <p className="text-sm text-balance text-muted-foreground">
        Revenue-related goals are automatically tracked with{" "}
        <Link
          href={`/sites/${publicId}/settings/revenue`}
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          revenue attribution
        </Link>
      </p>
    </div>
  </SamplePreview>
)
