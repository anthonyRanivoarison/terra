export type Position = number[]
export type Vec3 = [number, number, number]
export type Point = [number, number]

export type Geometry =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] }

export type Feature = {
  properties: { name?: string | null } | null
  geometry: Geometry | null
}

export type FeatureCollection = { features: Feature[] }

export type Projection = {
  center: Point
  radius: number
  rotate: [number, number]
  minStep: number
}

const RAD = Math.PI / 180

export function rotator([lon0, lat0]: [number, number]) {
  const sin0 = Math.sin(lat0 * RAD)
  const cos0 = Math.cos(lat0 * RAD)
  return ([lon, lat]: Position): Vec3 => {
    const lambda = (lon! - lon0) * RAD
    const phi = lat! * RAD
    const cosPhi = Math.cos(phi)
    const sinPhi = Math.sin(phi)
    const cosLambda = Math.cos(lambda)
    return [
      cosPhi * Math.sin(lambda),
      cos0 * sinPhi - sin0 * cosPhi * cosLambda,
      sin0 * sinPhi + cos0 * cosPhi * cosLambda,
    ]
  }
}

export const toScreen = (
  { center, radius }: Projection,
  [x, y]: Vec3 | Point
): Point => [center[0] + radius * x, center[1] - radius * y]

export const round = (value: number) => Math.round(value * 10) / 10

const num = (value: number) => String(round(value)).replace(/^(-?)0\./, "$1.")

const pair = (x: number, y: number) => `${num(x)}${y < 0 ? "" : " "}${num(y)}`

export function simplify(points: Point[], minStep: number): Point[] {
  return points.filter((point, i) => {
    if (i === 0 || i === points.length - 1) return true
    const prev = points[i - 1]!
    return Math.hypot(point[0] - prev[0], point[1] - prev[1]) >= minStep
  })
}

export function pathOf(points: Point[], close = false): string {
  let [px, py] = [round(points[0]![0]), round(points[0]![1])]
  let d = `M${pair(px, py)}l`
  points.slice(1).forEach(([x, y], i) => {
    const [rx, ry] = [round(x), round(y)]
    const dx = round(rx - px)
    d += `${i > 0 && dx >= 0 ? " " : ""}${pair(dx, round(ry - py))}`
    ;[px, py] = [rx, ry]
  })
  return close ? `${d}z` : d
}

export function polygonsOf(geometry: Geometry | null): Position[][] {
  if (!geometry) return []
  return geometry.type === "Polygon"
    ? geometry.coordinates.slice(0, 1)
    : geometry.coordinates.map((polygon) => polygon[0]!)
}
