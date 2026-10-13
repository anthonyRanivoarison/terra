const clean = (host: string) => host.toLowerCase().replace(/^www\./, "")

export function hostAllowed(
  host: string,
  domain: string,
  allowed: readonly string[] = []
): boolean {
  const h = clean(host)
  return [domain, ...allowed].some((d) => {
    const root = clean(d)
    return h === root || h.endsWith(`.${root}`)
  })
}
