"use client"
/* eslint-disable react-hooks/immutability -- r3f mutates three.js objects and uniforms inside useFrame by design */

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Group, Vector3, type BufferAttribute } from "three"

import { buildPaths, buildPulses, buildTubes } from "./arc-geometry"
import { createArcMaterial, createPulseMaterial } from "./arc-materials"
import { ARCS, CHANNELS } from "./data"
import { Hub } from "./hub"
import { anchors, rig } from "./rig"

type ArcsType = {
  compact: boolean
}

const labelled = [
  ...CHANNELS.map((channel) => ({
    key: `channel:${channel.id}`,
    arc: channel.arc,
    kind: "channel" as const,
  })),
  ...ARCS.flatMap((arc, index) =>
    arc.amount === undefined
      ? []
      : [{ key: `revenue:${index}`, arc: index, kind: "revenue" as const }]
  ),
]

export const Arcs = ({ compact }: ArcsType) => {
  const pixelRatio = useThree((state) => state.viewport.dpr)
  const group = useRef<Group>(null)
  const clock = useRef(0)
  const segments = compact ? 40 : 64

  const paths = useMemo(() => buildPaths(segments), [segments])
  const tubes = useMemo(
    () => buildTubes(paths, segments, compact ? 0.008 : 0.0062),
    [paths, segments, compact]
  )
  const { pulses, geometry } = useMemo(
    () => buildPulses(paths, compact ? 1 : 2),
    [paths, compact]
  )
  const arcMaterial = useMemo(createArcMaterial, [])
  const pulseMaterial = useMemo(
    () => createPulseMaterial(64 * pixelRatio),
    [pixelRatio]
  )
  const scratch = useMemo(() => new Vector3(), [])

  useEffect(() => () => tubes.dispose(), [tubes])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => arcMaterial.dispose(), [arcMaterial])
  useEffect(() => () => pulseMaterial.dispose(), [pulseMaterial])

  useEffect(() => {
    const keys = labelled.map((label) => {
      anchors[label.key] = { position: new Vector3(), kind: label.kind }
      return label.key
    })
    return () => keys.forEach((key) => delete anchors[key])
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    clock.current += dt * rig.motion
    const intro = rig.intro
    arcMaterial.uniforms.uDraw!.value = intro
    arcMaterial.uniforms.uTime!.value = clock.current
    arcMaterial.uniforms.uRevenue!.value = rig.revenue
    pulseMaterial.uniforms.uRevenue!.value = rig.revenue
    pulseMaterial.uniforms.uOpacity!.value = Math.max(0, intro * 1.4 - 0.4)

    const position = geometry.attributes.position as BufferAttribute
    const progress = geometry.attributes.aT as BufferAttribute
    pulses.forEach((pulse, index) => {
      const points = paths[pulse.arc]!.points
      const t = (pulse.phase + clock.current * pulse.speed) % 1
      const f = t * (points.length - 1)
      const i = Math.min(points.length - 2, Math.floor(f))
      scratch.lerpVectors(points[i]!, points[i + 1]!, f - i)
      position.setXYZ(index, scratch.x, scratch.y, scratch.z)
      progress.setX(index, t)
    })
    position.needsUpdate = true
    progress.needsUpdate = true

    const matrix = group.current?.matrixWorld
    if (!matrix) return
    labelled.forEach((label) => {
      anchors[label.key]?.position
        .copy(paths[label.arc]!.apex)
        .applyMatrix4(matrix)
    })
  })

  return (
    <group ref={group}>
      <mesh geometry={tubes} material={arcMaterial} />
      <points
        geometry={geometry}
        material={pulseMaterial}
        frustumCulled={false}
      />
      <Hub />
    </group>
  )
}
