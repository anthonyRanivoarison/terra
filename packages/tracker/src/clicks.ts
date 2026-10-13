export type Props = Record<string, string | number | boolean>
type Track = (name: string, props?: Props) => void

const label = (el: Element): string =>
  (el.getAttribute("aria-label") ?? el.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)

const snake = (key: string): string =>
  key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, "")

function named(el: HTMLElement): { name: string; props: Props } | null {
  const name = el.dataset.goal ?? el.dataset.track
  if (!name) return null
  const prefix = el.dataset.goal ? "goal" : "track"
  const props: Props = {}
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key.startsWith(prefix) && key !== prefix && value) {
      props[snake(key.slice(prefix.length))] = value
    }
  }
  return { name, props }
}

function report(el: Element, track: Track): void {
  const goal = el instanceof HTMLElement ? named(el) : null
  if (goal) return track(goal.name, goal.props)
  const href = el instanceof HTMLAnchorElement ? el.href : null
  const url = href ? new URL(href, location.href) : null
  const props: Props = { text: label(el) }
  if (el.id) props.id = el.id
  if (url && url.host !== location.host && /^https?:$/.test(url.protocol)) {
    return track("outbound_click", { ...props, href: url.href.slice(0, 255) })
  }
  if (url) props.href = `${url.pathname}${url.hash}`.slice(0, 255)
  track("click", props)
}

export function listenClicks(track: Track): void {
  document.addEventListener(
    "click",
    (event) => {
      const el =
        event.target instanceof Element
          ? event.target.closest("[data-goal],[data-track],a[href],button")
          : null
      if (!el) return
      const leaving =
        el instanceof HTMLAnchorElement && el.host !== location.host
      if (leaving) report(el, track)
      else setTimeout(() => report(el, track), 0)
    },
    { capture: true, passive: true }
  )
}
