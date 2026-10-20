import { Vector3 } from "three"
import { CITIES, HUB, arcPoints, toVector } from "./geo"

export const STEPS = 64
const RADIUS = 2.01

let cache: Vector3[][] | null = null

export const getArcs = () => {
  if (cache) return cache
  const hub = toVector(HUB.lat, HUB.lon, RADIUS)
  cache = CITIES.map((c) =>
    arcPoints(toVector(c.lat, c.lon, RADIUS), hub, RADIUS, STEPS)
  )
  return cache
}

export const sampleArc = (arc: Vector3[], t: number, out: Vector3) => {
  const f = t * STEPS
  const j = Math.min(STEPS - 1, Math.floor(f))
  return out.lerpVectors(arc[j]!, arc[j + 1]!, f - j)
}
