let displayNames: Intl.DisplayNames | null = null

export function countryName(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return code
  try {
    displayNames ??= new Intl.DisplayNames(["en"], { type: "region" })
    return displayNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}
