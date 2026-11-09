import { Fragment } from "react"

type SplitCharsType = { text: string; className?: string }

export const SplitChars = ({ text, className }: SplitCharsType) => (
  <span aria-hidden className={`block ${className ?? ""}`}>
    {text.split(" ").map((word, wi, words) => (
      <Fragment key={wi}>
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
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
)
