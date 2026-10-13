const VISITOR = "_terra_v"
const SESSION = "_terra_s"
const SESSION_MS = 30 * 60 * 1000
const YEAR_S = 365 * 24 * 60 * 60

let cookieDomain = ""

export function setCookieDomain(domain: string): void {
  const host = location.hostname
  cookieDomain =
    host === domain || host.endsWith(`.${domain}`) ? `.${domain}` : ""
}

function read(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  if (match?.[1]) return decodeURIComponent(match[1])
  try {
    return localStorage.getItem(name)
  } catch {
    return null
  }
}

function write(name: string, value: string, maxAge: number): void {
  const domain = cookieDomain ? `; domain=${cookieDomain}` : ""
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}${secure}`
  try {
    localStorage.setItem(name, value)
  } catch {}
}

export function visitorId(): string {
  let id = read(VISITOR)
  if (!id) id = crypto.randomUUID().replace(/-/g, "")
  write(VISITOR, id, YEAR_S)
  return id
}

export function touchSession(): { id: string; isNew: boolean } {
  const [id, seen] = (read(SESSION) ?? "").split(".")
  const alive = !!id && Date.now() - Number(seen) < SESSION_MS
  const current = alive ? id! : crypto.randomUUID()
  write(SESSION, `${current}.${Date.now()}`, SESSION_MS / 1000)
  return { id: current, isNew: !alive }
}

export function currentSession(): string | null {
  const [id, seen] = (read(SESSION) ?? "").split(".")
  return id && Date.now() - Number(seen) < SESSION_MS ? id : null
}
