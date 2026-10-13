import type { Point } from "./orthographic"

export type LabelKind = "land" | "city" | "sea"

export type Label = { lines: string[]; x: number; y: number; kind: LabelKind }

export type LabelCandidate = { text: string; area: number; at: Point }

export type Place = { text: string; at: [number, number] }

export type Box = [number, number, number, number]

export const LABEL_SIZE: Record<LabelKind, number> = {
  land: 20,
  city: 18,
  sea: 18,
}

const SHORT: Record<string, string> = {
  "United States of America": "United States",
  "Central African Rep.": "Central African Republic",
  "Dem. Rep. Congo": "DR Congo",
  "Bosnia and Herz.": "Bosnia",
  "W. Sahara": "Western Sahara",
  "S. Sudan": "South Sudan",
  "Eq. Guinea": "Equatorial Guinea",
}

export const SEAS: Place[] = [
  { text: "Atlantic Ocean", at: [-22, 33] },
  { text: "Mediterranean Sea", at: [18.5, 34.3] },
  { text: "Arabian Sea", at: [63, 16] },
  { text: "Black Sea", at: [34.5, 43.3] },
  { text: "Red Sea", at: [38.6, 20.6] },
]

export const CITIES: Place[] = [
  { text: "Paris", at: [2.35, 48.86] },
  { text: "Cairo", at: [31.24, 30.04] },
  { text: "Riyadh", at: [46.72, 24.69] },
  { text: "Tehran", at: [51.39, 35.69] },
  { text: "Karachi", at: [67.01, 24.86] },
  { text: "New Delhi", at: [77.21, 28.61] },
  { text: "Istanbul", at: [28.98, 41.01] },
]

function wrap(text: string): string[] {
  const words = text.split(" ")
  if (text.length <= 12 || words.length < 2) return [text]
  const gap = (i: number) =>
    Math.abs(words.slice(0, i).join(" ").length - text.length / 2)
  let best = 1
  for (let i = 2; i < words.length; i++) if (gap(i) < gap(best)) best = i
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")]
}

export function boxOf(
  lines: string[],
  [x, y]: Point,
  kind: LabelKind,
  pad = 0
): Box {
  const size = LABEL_SIZE[kind]
  const advance = kind === "sea" ? 0.66 : 0.54
  const width = Math.max(...lines.map((line) => line.length)) * size * advance
  const height = lines.length * size * 1.2
  return [
    x - width / 2 - pad,
    y - height / 2 - pad,
    x + width / 2 + pad,
    y + height / 2 + pad,
  ]
}

const overlaps = (a: Box, b: Box) =>
  a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]

type PlaceLabelsType = {
  seas: LabelCandidate[]
  countries: LabelCandidate[]
  cities: LabelCandidate[]
  fits: (box: Box) => boolean
  max?: number
}

export function placeLabels({
  seas,
  countries,
  cities,
  fits,
  max = 60,
}: PlaceLabelsType): Label[] {
  const boxes: Box[] = []
  const labels: Label[] = []
  const tryPlace = (
    { text, at }: LabelCandidate,
    kind: LabelKind,
    room = Infinity
  ) => {
    if (labels.length >= max) return
    const lines = wrap(kind === "land" ? (SHORT[text] ?? text) : text)
    const step = LABEL_SIZE[kind] * 1.6
    for (const shift of kind === "land" ? [0, step, -step] : [0]) {
      const point: Point = [at[0], at[1] + shift]
      const box = boxOf(lines, point, kind)
      if (box[2] - box[0] > room || !fits(box)) continue
      const padded = boxOf(lines, point, kind, LABEL_SIZE[kind] * 0.6)
      if (boxes.some((other) => overlaps(padded, other))) continue
      boxes.push(padded)
      labels.push({ lines, x: point[0], y: point[1], kind })
      return
    }
  }
  seas.forEach((sea) => tryPlace(sea, "sea"))
  cities.forEach((city) => tryPlace(city, "city"))
  ;[...countries]
    .sort((a, b) => b.area - a.area)
    .forEach((country) =>
      tryPlace(country, "land", Math.sqrt(country.area) * 3)
    )
  return labels
}
