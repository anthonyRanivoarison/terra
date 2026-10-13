export function listTimezones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone")
  return zones.includes("UTC") ? zones : ["UTC", ...zones]
}

export function isTimezone(value: string): boolean {
  return listTimezones().includes(value)
}

export function timezoneLabel(zone: string): string {
  return zone.replaceAll("_", " ").split("/").join(" - ")
}

const formatters = new Map<string, Intl.DateTimeFormat>()

export function timeIn(zone: string, date: Date): string {
  let formatter = formatters.get(zone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
    })
    formatters.set(zone, formatter)
  }
  return formatter.format(date)
}

export function browserTimezone(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return zone && isTimezone(zone) ? zone : "UTC"
}
