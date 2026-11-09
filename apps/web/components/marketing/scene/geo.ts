import { Vector3 } from "three"

export const HUB = { name: "Your site", lat: 48.86, lon: 2.35 }

export const CITIES = [
  { lat: 40.71, lon: -74.0, rate: 0.22 },
  { lat: 37.77, lon: -122.42, rate: 0.28 },
  { lat: 43.65, lon: -79.38, rate: 0.16 },
  { lat: -23.55, lon: -46.63, rate: 0.12 },
  { lat: 19.43, lon: -99.13, rate: 0.1 },
  { lat: 51.51, lon: -0.13, rate: 0.3 },
  { lat: 52.52, lon: 13.4, rate: 0.26 },
  { lat: 40.42, lon: -3.7, rate: 0.18 },
  { lat: 59.33, lon: 18.07, rate: 0.24 },
  { lat: -18.88, lon: 47.51, rate: 0.14 },
  { lat: 6.52, lon: 3.38, rate: 0.08 },
  { lat: 30.04, lon: 31.24, rate: 0.1 },
  { lat: 25.2, lon: 55.27, rate: 0.2 },
  { lat: 19.08, lon: 72.88, rate: 0.12 },
  { lat: 1.35, lon: 103.82, rate: 0.22 },
  { lat: 35.68, lon: 139.69, rate: 0.26 },
  { lat: -33.87, lon: 151.21, rate: 0.2 },
  { lat: 37.57, lon: 126.98, rate: 0.18 },
]

export const toVector = (lat: number, lon: number, radius: number) => {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export const arcPoints = (
  from: Vector3,
  to: Vector3,
  radius: number,
  steps: number
) => {
  const a = from.clone().normalize()
  const b = to.clone().normalize()
  const angle = a.angleTo(b)
  const lift = 0.12 + angle * 0.32
  const points: Vector3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const s = Math.sin(angle)
    const p =
      s < 1e-4
        ? a.clone()
        : a
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / s)
            .add(b.clone().multiplyScalar(Math.sin(t * angle) / s))
    points.push(
      p.normalize().multiplyScalar(radius + Math.sin(Math.PI * t) * lift)
    )
  }
  return points
}
