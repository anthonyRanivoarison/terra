let endpoint = ""
let websiteId = ""
let debug = false

export function configureSend(url: string, id: string, verbose: boolean): void {
  endpoint = url
  websiteId = id
  debug = verbose
}

export function send(payload: Record<string, unknown>): void {
  const body = JSON.stringify({ ...payload, websiteId })
  if (debug) console.info("[terra]", payload)
  const blob = new Blob([body], { type: "text/plain;charset=UTF-8" })
  if (navigator.sendBeacon?.(endpoint, blob)) return
  void fetch(endpoint, { method: "POST", body, keepalive: true }).catch(
    () => {}
  )
}
