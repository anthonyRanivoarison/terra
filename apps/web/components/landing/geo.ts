import { Vector3 } from "three"

import { LAND_MASK, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from "./land-mask"

export const RADIUS = 2

const toRad = Math.PI / 180

export const latLonToVector = (lat: number, lon: number, radius = RADIUS) => {
  const phi = (90 - lat) * toRad
  const theta = (lon + 180) * toRad
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const decodeMask = () => {
  const binary = atob(LAND_MASK)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export const landDots = (spacing: number) => {
  const mask = decodeMask()
  const isLand = (lat: number, lon: number) => {
    const row = Math.min(LAND_MASK_HEIGHT - 1, Math.floor(90 - lat))
    const col = Math.min(LAND_MASK_WIDTH - 1, Math.floor(lon + 180))
    const bit = row * LAND_MASK_WIDTH + col
    return ((mask[bit >> 3]! >> (bit & 7)) & 1) === 1
  }
  const points: number[] = []
  const scratch = new Vector3()
  for (let lat = -90 + spacing / 2; lat < 90; lat += spacing) {
    const count = Math.max(
      1,
      Math.round((360 / spacing) * Math.cos(lat * toRad))
    )
    const offset = (Math.abs(Math.round(lat / spacing)) % 2) * 0.5
    for (let i = 0; i < count; i++) {
      const lon = -180 + ((i + offset) / count) * 360
      if (!isLand(lat, lon)) continue
      scratch.copy(latLonToVector(lat, lon, RADIUS * 1.003))
      points.push(scratch.x, scratch.y, scratch.z)
    }
  }
  return new Float32Array(points)
}

export const arcPoints = (from: Vector3, to: Vector3, segments: number) => {
  const a = from.clone().normalize()
  const b = to.clone().normalize()
  const angle = a.angleTo(b)
  const lift = 0.08 + 0.42 * (angle / Math.PI)
  const axis = new Vector3().crossVectors(a, b).normalize()
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const height = RADIUS * (1.004 + lift * Math.sin(Math.PI * t))
    points.push(
      a
        .clone()
        .applyAxisAngle(axis, angle * t)
        .multiplyScalar(height)
    )
  }
  return points
}
