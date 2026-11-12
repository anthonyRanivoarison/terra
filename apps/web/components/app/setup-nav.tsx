import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import { SetupSteps } from "./setup-steps"

type SetupNavType = {
  current: 0 | 1 | 2
  revenueHref?: string
}

export const SetupNav = ({ current, revenueHref }: SetupNavType) => (
  <nav aria-label="Setup" className="flex flex-col items-start gap-6">
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href="/sites" />}
    >
      <ArrowLeftIcon aria-hidden />
      Dashboard
    </Button>
    <SetupSteps current={current} revenueHref={revenueHref} />
  </nav>
)
