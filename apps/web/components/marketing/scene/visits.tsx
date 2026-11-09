"use client"

import { useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
  Vector3,
} from "three"
import { STEPS, getArcs, sampleArc } from "./arcs"
import { rig } from "./rig"

type VisitsType = { perArc: number }

export const Visits = ({ perArc }: VisitsType) => {
  const arcs = getArcs()

  const objects = useMemo(() => {
    const lines = new Float32Array(arcs.length * STEPS * 6)
    let k = 0
    for (const arc of arcs)
      for (let i = 0; i < STEPS; i++) {
        lines.set([arc[i]!.x, arc[i]!.y, arc[i]!.z], k)
        lines.set([arc[i + 1]!.x, arc[i + 1]!.y, arc[i + 1]!.z], k + 3)
        k += 6
      }
    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute("position", new BufferAttribute(lines, 3))
    const lineMaterial = new LineBasicMaterial({
      color: "#6f8dff",
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const dotGeometry = new BufferGeometry()
    const positions = new BufferAttribute(
      new Float32Array(arcs.length * perArc * 3),
      3
    )
    positions.setUsage(DynamicDrawUsage)
    dotGeometry.setAttribute("position", positions)
    const dotMaterial = new PointsMaterial({
      color: "#8fa6ff",
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    const cityGeometry = new BufferGeometry()
    const cities = new Float32Array((arcs.length + 1) * 3)
    arcs.forEach((arc, i) =>
      cities.set([arc[0]!.x, arc[0]!.y, arc[0]!.z], i * 3)
    )
    const hub = arcs[0]![STEPS]!
    cities.set([hub.x, hub.y, hub.z], arcs.length * 3)
    cityGeometry.setAttribute("position", new BufferAttribute(cities, 3))
    const cityMaterial = new PointsMaterial({
      color: "#c7d3ff",
      size: 3,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
    return {
      lines: new LineSegments(lineGeometry, lineMaterial),
      dots: new Points(dotGeometry, dotMaterial),
      cities: new Points(cityGeometry, cityMaterial),
      positions,
      disposables: [
        lineGeometry,
        lineMaterial,
        dotGeometry,
        dotMaterial,
        cityGeometry,
        cityMaterial,
      ],
    }
  }, [arcs, perArc])

  useEffect(
    () => () => objects.disposables.forEach((d) => d.dispose()),
    [objects]
  )

  const state = useMemo(
    () => ({
      dots: Array.from({ length: arcs.length * perArc }, (_, i) => ({
        arc: i % arcs.length,
        t: (i * 0.618) % 1,
        speed: 0.16 + ((i * 37) % 10) / 60,
      })),
      point: new Vector3(),
    }),
    [arcs.length, perArc]
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20) * (0.2 + 0.8 * rig.motion)
    const pos = objects.positions.array as Float32Array
    state.dots.forEach((d, i) => {
      d.t = (d.t + dt * d.speed) % 1
      sampleArc(arcs[d.arc]!, d.t, state.point)
      pos.set([state.point.x, state.point.y, state.point.z], i * 3)
    })
    objects.positions.needsUpdate = true
    objects.lines.material.opacity = rig.arcs * 0.22
    objects.dots.material.opacity = rig.arcs * 0.7
    objects.lines.visible = rig.arcs > 0.01
    objects.dots.visible = rig.arcs > 0.01
  })

  return (
    <group>
      <primitive object={objects.lines} />
      <primitive object={objects.cities} />
      <primitive object={objects.dots} />
    </group>
  )
}
