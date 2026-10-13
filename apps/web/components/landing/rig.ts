import { Vector3 } from "three"

export type Shot = {
  px: number
  py: number
  pz: number
  tx: number
  ty: number
  tz: number
  fov: number
}

export type ShotName = "hero" | "sources" | "revenue" | "ai" | "away"

const wide: Record<ShotName, Shot> = {
  hero: { px: 0, py: 0.5, pz: 8.6, tx: -2.5, ty: 0.25, tz: 0, fov: 36 },
  sources: { px: 1.3, py: 1.5, pz: 5.9, tx: -1.35, ty: 0.75, tz: 0, fov: 38 },
  revenue: { px: -1.7, py: 1.1, pz: 5.7, tx: 1.45, ty: 0.55, tz: 0, fov: 40 },
  ai: { px: 2.1, py: 2.6, pz: 9.8, tx: -2.3, ty: 0.3, tz: 0, fov: 38 },
  away: { px: 0, py: 5.4, pz: 9.6, tx: 0, ty: 4.6, tz: 0, fov: 40 },
}

const compact: Record<ShotName, Shot> = {
  hero: { px: 0, py: 2.5, pz: 11.5, tx: 0, ty: 2.3, tz: 0, fov: 40 },
  sources: { px: 0.6, py: 2.7, pz: 8.4, tx: 0, ty: 2, tz: 0, fov: 42 },
  revenue: { px: -0.6, py: 2.4, pz: 8.2, tx: 0, ty: 1.9, tz: 0, fov: 42 },
  ai: { px: 0, py: 3.3, pz: 12.5, tx: 0, ty: 2.4, tz: 0, fov: 42 },
  away: { px: 0, py: 7, pz: 12, tx: 0, ty: 6.4, tz: 0, fov: 42 },
}

export const shotsFor = (isCompact: boolean) => (isCompact ? compact : wide)

export const rig = {
  ...wide.hero,
  spin: 0,
  labels: 0,
  revenue: 0,
  ai: 0,
  intro: 0,
  motion: 1,
  recede: 0,
  away: { ...wide.away },
}

export const pointer = { x: 0, y: 0 }

export type AnchorKind = "channel" | "revenue" | "crawler"

export const anchors: Record<string, { position: Vector3; kind: AnchorKind }> =
  {}

export const hubWorld = new Vector3()

export const labelNodes: Record<string, HTMLElement | null> = {}

export const resetRig = (reduced: boolean, isCompact: boolean) => {
  const shots = shotsFor(isCompact)
  Object.assign(rig, shots.hero, {
    spin: 0,
    labels: 0,
    revenue: reduced ? 0.6 : 0,
    ai: reduced ? 1 : 0,
    intro: reduced ? 1 : 0,
    motion: reduced ? 0 : 1,
    recede: 0,
    away: { ...shots.away },
  })
  pointer.x = 0
  pointer.y = 0
}
