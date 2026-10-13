import { readFileSync } from "node:fs"
import path from "node:path"
import { areaAndCentroid, clipRing } from "./clip"
import {
  CITIES,
  SEAS,
  placeLabels,
  type Box,
  type Label,
  type LabelCandidate,
  type Place,
} from "./labels"
import {
  pathOf,
  polygonsOf,
  rotator,
  round,
  simplify,
  toScreen,
  type FeatureCollection,
  type Point,
  type Projection,
} from "./orthographic"

export type Globe = { land: string; labels: Label[] }

function bounds(points: Point[]): Box {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
}

const intersects = (a: Box, b: Box) =>
  a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]

export function buildGlobe(
  collection: FeatureCollection,
  projection: Projection,
  view: Box
): Globe {
  const rotate = rotator(projection.rotate)
  const { center, radius, minStep } = projection
  const minArea = minStep * minStep * 2
  const countries: LabelCandidate[] = []
  let land = ""
  for (const feature of collection.features) {
    let best: { area: number; at: Point } | null = null
    let total = 0
    for (const ring of polygonsOf(feature.geometry)) {
      const points = simplify(
        clipRing(ring, rotate).map((p) => toScreen(projection, p)),
        minStep
      )
      if (points.length < 3 || !intersects(bounds(points), view)) continue
      const [area, at] = areaAndCentroid(points)
      if (area < minArea) continue
      land += pathOf(points, true)
      total += area
      if (!best || area > best.area) best = { area, at }
    }
    const name = feature.properties?.name
    if (best && name) countries.push({ text: name, area: total, at: best.at })
  }
  const places = (list: Place[]) =>
    list.flatMap(({ text, at }) => {
      const vector = rotate(at)
      if (vector[2] < 0.05) return []
      return [{ text, area: 0, at: toScreen(projection, vector) }]
    })
  const inside = ([x, y]: Point) =>
    Math.hypot(x - center[0], y - center[1]) < radius * 0.992
  const fits = (box: Box) =>
    box[0] >= view[0] &&
    box[2] <= view[2] &&
    box[3] <= view[3] &&
    inside([box[0], box[1]]) &&
    inside([box[2], box[1]]) &&
    inside([(box[0] + box[2]) / 2, box[1]])
  const labels = placeLabels({
    seas: places(SEAS),
    countries,
    cities: places(CITIES),
    fits,
  }).map((label) => ({ ...label, x: round(label.x), y: round(label.y) }))
  return { land, labels }
}

const cache = new Map<string, Globe>()

export function loadGlobe(projection: Projection, view: Box): Globe {
  const key = JSON.stringify([projection, view])
  const hit = cache.get(key)
  if (hit) return hit
  const file = path.join(process.cwd(), "public/geo/world-110m.json")
  const geo = JSON.parse(readFileSync(file, "utf8")) as FeatureCollection
  const globe = buildGlobe(geo, projection, view)
  cache.set(key, globe)
  return globe
}
