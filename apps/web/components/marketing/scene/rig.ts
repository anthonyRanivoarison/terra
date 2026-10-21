export type Shot = {
  px: number
  py: number
  pz: number
  tx: number
  ty: number
  tz: number
  fov: number
}

export const shots = {
  hero: { px: 0.4, py: 0.6, pz: 7.4, tx: -2.1, ty: 0.15, tz: 0, fov: 38 },
  traffic: { px: -0.6, py: 4.6, pz: 7.6, tx: 0, ty: -0.2, tz: 0, fov: 40 },
  trafficDrift: { px: -2.6, py: 3.8, pz: 7.2, tx: 0, ty: -0.2, tz: 0, fov: 40 },
  revenue: { px: 3.2, py: 2, pz: 6.6, tx: 2.1, ty: 0.3, tz: -1, fov: 40 },
  revenuePush: {
    px: 2.9,
    py: 1.8,
    pz: 6.1,
    tx: 2,
    ty: 0.35,
    tz: -0.95,
    fov: 41,
  },
  live: { px: 3.6, py: 1.4, pz: 4.8, tx: -1.56, ty: 0.4, tz: 1.16, fov: 42 },
  ai: { px: 0.2, py: -1.4, pz: 8.2, tx: -3, ty: 0, tz: 0, fov: 40 },
  aiDrift: { px: -0.4, py: -1, pz: 7.4, tx: -2.9, ty: 0.1, tz: 0, fov: 40 },
} satisfies Record<string, Shot>

export const rig = {
  ...shots.hero,
  arcs: 0,
  sales: 0,
  live: 0,
  intro: 0,
  motion: 1,
}

export const pointer = { x: 0, y: 0 }

export const readouts: {
  visits: HTMLElement | null
  ai: HTMLElement | null
} = { visits: null, ai: null }

export const tally = { visits: 48_210, ai: 8_340 }

export const resetRig = (reduced: boolean) => {
  Object.assign(rig, shots.hero, {
    arcs: reduced ? 1 : 0,
    live: 0,
    sales: reduced ? 1 : 0,
    intro: reduced ? 1 : 0,
    motion: reduced ? 0 : 1,
  })
  pointer.x = 0
  pointer.y = 0
}
