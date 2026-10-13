import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  DynamicDrawUsage,
  TubeGeometry,
  type Vector3,
} from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { ARCS, HUB, mulberry32 } from "./data"
import { arcPoints, latLonToVector } from "./geo"

export type ArcPath = { points: Vector3[]; apex: Vector3; buyer: boolean }

export const buildPaths = (segments: number): ArcPath[] => {
  const hub = latLonToVector(HUB.lat, HUB.lon)
  return ARCS.map((arc) => {
    const points = arcPoints(latLonToVector(arc.lat, arc.lon), hub, segments)
    return {
      points,
      apex: points[Math.floor(segments / 2)]!.clone(),
      buyer: arc.amount !== undefined,
    }
  })
}

export const buildTubes = (
  paths: ArcPath[],
  segments: number,
  radius: number
) => {
  const random = mulberry32(2207)
  const tubes = paths.map((path) => {
    const tube = new TubeGeometry(
      new CatmullRomCurve3(path.points),
      segments,
      radius * (path.buyer ? 1.45 : 1),
      5,
      false
    )
    const count = tube.attributes.position!.count
    const seed = random()
    tube.setAttribute(
      "aKind",
      new BufferAttribute(new Float32Array(count).fill(path.buyer ? 1 : 0), 1)
    )
    tube.setAttribute(
      "aSeed",
      new BufferAttribute(new Float32Array(count).fill(seed), 1)
    )
    return tube
  })
  const merged = mergeGeometries(tubes)
  tubes.forEach((tube) => tube.dispose())
  return merged
}

export type Pulse = { arc: number; phase: number; speed: number }

export const buildPulses = (paths: ArcPath[], perArc: number) => {
  const random = mulberry32(5150)
  const pulses: Pulse[] = paths.flatMap((_, arc) =>
    Array.from({ length: perArc }, (_, k) => ({
      arc,
      phase: (k + random() * 0.6) / perArc,
      speed: 0.09 + random() * 0.07,
    }))
  )
  const geometry = new BufferGeometry()
  const position = new BufferAttribute(new Float32Array(pulses.length * 3), 3)
  const progress = new BufferAttribute(new Float32Array(pulses.length), 1)
  position.setUsage(DynamicDrawUsage)
  progress.setUsage(DynamicDrawUsage)
  geometry.setAttribute("position", position)
  geometry.setAttribute("aT", progress)
  geometry.setAttribute(
    "aKind",
    new BufferAttribute(
      new Float32Array(pulses.map((p) => (paths[p.arc]!.buyer ? 1 : 0))),
      1
    )
  )
  return { pulses, geometry }
}
