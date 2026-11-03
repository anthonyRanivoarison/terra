import { cn } from "@workspace/ui/lib/utils"
import { Experience } from "./experience"
import { instrumentSans, spaceGrotesk } from "./fonts"
import { SmoothScroll } from "./smooth-scroll"
import "./marketing.css"

type LandingType = { signedIn: boolean; demo: boolean }

export const Landing = ({ signedIn, demo }: LandingType) => (
  <div
    className={cn(
      "dark marketing relative min-h-dvh antialiased",
      instrumentSans.variable,
      spaceGrotesk.variable
    )}
  >
    <a
      href="#content"
      className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-foreground px-4 py-3 text-sm text-background focus-visible:translate-y-0"
    >
      Skip to content
    </a>
    <SmoothScroll>
      <Experience signedIn={signedIn} demo={demo} />
    </SmoothScroll>
    <div
      aria-hidden
      className="marketing-grain pointer-events-none fixed inset-0 z-[60]"
    />
  </div>
)
