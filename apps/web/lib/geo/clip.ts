import type { Point, Position, Vec3 } from "./orthographic"

const ARC_STEP = (3 * Math.PI) / 180

const visible = (v: Vec3) => v[2] >= 0

function horizon(inside: Vec3, outside: Vec3): number {
  let [a, b] = [inside, outside]
  for (let i = 0; i < 14; i++) {
    const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
    if (visible(mid)) a = mid
    else b = mid
  }
  return Math.atan2(a[1], a[0])
}

const limb = (angle: number): Point => [Math.cos(angle), Math.sin(angle)]

function arc(from: number, to: number): Point[] {
  let delta = to - from
  while (delta > Math.PI) delta -= 2 * Math.PI
  while (delta < -Math.PI) delta += 2 * Math.PI
  const steps = Math.ceil(Math.abs(delta) / ARC_STEP)
  return Array.from({ length: steps + 1 }, (_, i) =>
    limb(from + (delta * i) / steps)
  )
}

export function clipRing(
  ring: Position[],
  rotate: (p: Position) => Vec3
): Point[] {
  const vectors = ring.map(rotate)
  const start = vectors.findIndex(visible)
  if (start < 0) return []
  if (vectors.every(visible)) return vectors.map(([x, y]) => [x, y])
  const n = vectors.length
  const out: Point[] = []
  let exit = 0
  for (let i = 0; i < n; i++) {
    const cur = vectors[(start + i) % n]!
    const next = vectors[(start + i + 1) % n]!
    if (visible(cur)) {
      out.push([cur[0], cur[1]])
      if (!visible(next)) exit = horizon(cur, next)
    } else if (visible(next)) {
      out.push(...arc(exit, horizon(next, cur)))
    }
  }
  return out
}

export function areaAndCentroid(points: Point[]): [number, Point] {
  let area = 0
  let cx = 0
  let cy = 0
  points.forEach(([x0, y0], i) => {
    const [x1, y1] = points[(i + 1) % points.length]!
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  })
  if (Math.abs(area) < 1e-9) return [0, points[0] ?? [0, 0]]
  return [Math.abs(area / 2), [cx / (3 * area), cy / (3 * area)]]
}
