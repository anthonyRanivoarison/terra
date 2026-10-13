import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

type Ring = number[][]
type Feature = {
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown }
}

const root = join(import.meta.dir, "..")
const world = JSON.parse(
  readFileSync(join(root, "public/geo/world-110m.json"), "utf8")
) as { features: Feature[] }

const polygons: Ring[][] = world.features.flatMap((feature) =>
  feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates as Ring[]]
    : (feature.geometry.coordinates as Ring[][])
)

const boxes = polygons.map((rings) => {
  const xs = rings[0]!.map((p) => p[0]!)
  const ys = rings[0]!.map((p) => p[1]!)
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
})

const insideRing = (ring: Ring, x: number, y: number) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    if (
      yi! > y !== yj! > y &&
      x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!
    )
      inside = !inside
  }
  return inside
}

const isLand = (lon: number, lat: number) =>
  polygons.some((rings, index) => {
    const [x0, y0, x1, y1] = boxes[index]!
    if (lon < x0! || lon > x1! || lat < y0! || lat > y1!) return false
    return rings.reduce(
      (acc, ring) => acc !== insideRing(ring, lon, lat),
      false
    )
  })

const width = 360
const height = 180
const bytes = new Uint8Array((width * height) / 8)
for (let row = 0; row < height; row++) {
  for (let col = 0; col < width; col++) {
    if (isLand(-180 + col + 0.5, 90 - row - 0.5)) {
      const bit = row * width + col
      bytes[bit >> 3]! |= 1 << (bit & 7)
    }
  }
}

const out = `export const LAND_MASK_WIDTH = ${width}
export const LAND_MASK_HEIGHT = ${height}
export const LAND_MASK =
  "${Buffer.from(bytes).toString("base64")}"
`
writeFileSync(join(root, "components/landing/land-mask.ts"), out)
console.log(
  `land cells: ${bytes.reduce((n, b) => n + b.toString(2).replace(/0/g, "").length, 0)}`
)
