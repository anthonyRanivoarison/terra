import type Lenis from "lenis"

export const scrollToId = (id: string, lenis?: Lenis) => {
  const element = document.getElementById(id)
  if (!element) return
  if (lenis) {
    lenis.scrollTo(element, { duration: 2, offset: -24 })
    return
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  element.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
}
