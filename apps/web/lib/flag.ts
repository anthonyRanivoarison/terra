export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return ""
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  )
}
