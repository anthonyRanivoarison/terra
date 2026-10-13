type NavigatorExtras = Navigator & {
  deviceMemory?: number
  connection?: { effectiveType?: string }
  userAgentData?: {
    getHighEntropyValues(hints: string[]): Promise<Record<string, unknown>>
  }
}

export async function collectClient() {
  const nav = navigator as NavigatorExtras
  let hints: Record<string, unknown> = {}
  try {
    hints =
      (await Promise.race([
        nav.userAgentData?.getHighEntropyValues([
          "platformVersion",
          "architecture",
          "bitness",
          "model",
          "fullVersionList",
        ]),
        new Promise<undefined>((r) => setTimeout(r, 300)),
      ])) ?? {}
  } catch {}

  const dpr = Math.round(window.devicePixelRatio * 100) / 100
  return {
    screen: `${screen.width}×${screen.height}${dpr !== 1 ? `@${dpr}x` : ""}`,
    viewport: `${window.innerWidth}×${window.innerHeight}`,
    language: navigator.language,
    cpuCores: navigator.hardwareConcurrency ?? null,
    memoryGb: nav.deviceMemory ?? null,
    connection: nav.connection?.effectiveType ?? null,
    hints,
  }
}
