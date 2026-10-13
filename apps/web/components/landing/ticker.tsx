"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type TickerType = {
  value: number
  format: (value: number) => string
}

export const Ticker = ({ value, format }: TickerType) => {
  const node = useRef<HTMLSpanElement>(null)
  const shown = useRef({ value })

  useEffect(() => {
    const state = shown.current
    const tween = gsap.to(state, {
      value,
      duration: 0.9,
      ease: "expo.out",
      onUpdate: () => {
        if (node.current) node.current.textContent = format(state.value)
      },
    })
    return () => {
      tween.kill()
    }
  }, [value, format])

  return <span ref={node}>{format(value)}</span>
}
