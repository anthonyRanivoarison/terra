import type Lenis from "lenis"

export const scrollToId = (id: string, lenis?: Lenis) => {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, { duration: 2 })
    return
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
}
