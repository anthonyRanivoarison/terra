import { Fragment } from "react"

import { cn } from "@workspace/ui/lib/utils"

type SplitCharsType = {
  lines: string[]
  accent?: string
}

export const SplitChars = ({ lines, accent }: SplitCharsType) => (
  <>
    <span className="sr-only">{lines.join(" ")}</span>
    {lines.map((line, li) => (
      <span key={li} aria-hidden className="block">
        {line.split(" ").map((word, wi, words) => (
          <Fragment key={wi}>
            <span
              className={cn(
                "inline-block overflow-hidden pb-[0.1em] align-bottom",
                word === accent && "text-primary"
              )}
            >
              {Array.from(word).map((char, ci) => (
                <span key={ci} className="split-char inline-block">
                  {char}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    ))}
  </>
)
