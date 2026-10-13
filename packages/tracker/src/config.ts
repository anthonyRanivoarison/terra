export type Config = {
  websiteId: string
  domain: string
  endpoint: string
  allowLocalhost: boolean
  debug: boolean
}

export function readConfig(script: HTMLScriptElement | null): Config | null {
  const data = script?.dataset
  const websiteId = data?.websiteId
  if (!script || !data || !websiteId) return null
  const origin = new URL(script.src, location.href).origin
  return {
    websiteId,
    domain: (data.domain || location.hostname).replace(/^www\./, ""),
    endpoint: `${(data.api || origin).replace(/\/$/, "")}/api/event`,
    allowLocalhost: data.allowLocalhost === "true",
    debug: data.debug === "true",
  }
}

export function shouldTrack(config: Config): boolean {
  const host = location.hostname.replace(/^www\./, "")
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host)
  if (local) return config.allowLocalhost
  if (navigator.webdriver) return false
  return host === config.domain || host.endsWith(`.${config.domain}`)
}
