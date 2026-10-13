"use client"
/* eslint-disable react-hooks/immutability -- r3f mutates three.js objects and scratch buffers inside useFrame by design */

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three"

import { CRAWLERS } from "./data"
import { PALETTE } from "./globe-materials"
import { anchors, hubWorld, rig } from "./rig"
import { createFadeMaterial } from "./trail-materials"

const TRAIL = 16

const dynamic = (size: number, itemSize: number) => {
  const attribute = new BufferAttribute(
    new Float32Array(size * itemSize),
    itemSize
  )
  attribute.setUsage(DynamicDrawUsage)
  return attribute
}

export const Satellites = () => {
  const pixelRatio = useThree((state) => state.viewport.dpr)
  const bodies = useRef<(Mesh | null)[]>([])
  const clock = useRef(0)

  const orbits = useMemo(
    () =>
      CRAWLERS.map((crawler) => ({
        ...crawler,
        quaternion: new Quaternion().setFromEuler(
          new Euler(crawler.tilt, crawler.node, 0, "YXZ")
        ),
      })),
    []
  )
  const trail = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", dynamic(CRAWLERS.length * TRAIL, 3))
    const alpha = new Float32Array(CRAWLERS.length * TRAIL)
    for (let i = 0; i < alpha.length; i++)
      alpha[i] = Math.pow(1 - (i % TRAIL) / TRAIL, 1.6)
    geometry.setAttribute("aAlpha", new BufferAttribute(alpha, 1))
    return geometry
  }, [])
  const beams = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", dynamic(CRAWLERS.length * 2, 3))
    geometry.setAttribute("aAlpha", dynamic(CRAWLERS.length * 2, 1))
    return geometry
  }, [])
  const trailMaterial = useMemo(
    () => createFadeMaterial(PALETTE.blue, true, 34 * pixelRatio),
    [pixelRatio]
  )
  const beamMaterial = useMemo(() => createFadeMaterial(PALETTE.sky, false), [])
  const bodyMaterial = useMemo(
    () => new MeshBasicMaterial({ color: PALETTE.navy, transparent: true }),
    []
  )
  const scratch = useMemo(() => new Vector3(), [])

  useEffect(() => {
    CRAWLERS.forEach((crawler) => {
      anchors[`crawler:${crawler.id}`] = {
        position: new Vector3(),
        kind: "crawler",
      }
    })
    return () => {
      CRAWLERS.forEach((crawler) => delete anchors[`crawler:${crawler.id}`])
      trail.dispose()
      beams.dispose()
      beamMaterial.dispose()
      bodyMaterial.dispose()
    }
  }, [trail, beams, beamMaterial, bodyMaterial])
  useEffect(() => () => trailMaterial.dispose(), [trailMaterial])

  useFrame((_, delta) => {
    clock.current += Math.min(delta, 1 / 20) * rig.motion
    const ai = rig.ai
    trailMaterial.uniforms.uOpacity!.value = ai * 0.8
    beamMaterial.uniforms.uOpacity!.value = ai
    bodyMaterial.opacity = ai
    const trailPositions = trail.attributes.position as BufferAttribute
    const beamPositions = beams.attributes.position as BufferAttribute
    const beamAlpha = beams.attributes.aAlpha as BufferAttribute

    orbits.forEach((orbit, index) => {
      const angle = orbit.phase + clock.current * orbit.speed
      for (let k = 0; k < TRAIL; k++) {
        const a = angle - k * 0.045
        scratch
          .set(Math.cos(a) * orbit.radius, 0, Math.sin(a) * orbit.radius)
          .applyQuaternion(orbit.quaternion)
        trailPositions.setXYZ(
          index * TRAIL + k,
          scratch.x,
          scratch.y,
          scratch.z
        )
        if (k === 0) {
          anchors[`crawler:${orbit.id}`]?.position.copy(scratch)
          bodies.current[index]?.position.copy(scratch)
          bodies.current[index]?.scale.setScalar(Math.max(0.001, ai))
          beamPositions.setXYZ(index * 2, scratch.x, scratch.y, scratch.z)
        }
      }
      beamPositions.setXYZ(index * 2 + 1, hubWorld.x, hubWorld.y, hubWorld.z)
      const read =
        rig.motion === 0
          ? 0.4
          : Math.pow(
              Math.max(0, Math.sin(clock.current * 0.8 + index * 1.7)),
              8
            )
      beamAlpha.setX(index * 2, read * 0.9)
      beamAlpha.setX(index * 2 + 1, read * 0.15)
    })
    trailPositions.needsUpdate = true
    beamPositions.needsUpdate = true
    beamAlpha.needsUpdate = true
  })

  return (
    <group>
      <points geometry={trail} material={trailMaterial} frustumCulled={false} />
      <lineSegments
        geometry={beams}
        material={beamMaterial}
        frustumCulled={false}
      />
      {CRAWLERS.map((crawler, index) => (
        <mesh
          key={crawler.id}
          ref={(node) => {
            bodies.current[index] = node
          }}
          material={bodyMaterial}
        >
          <octahedronGeometry args={[0.05, 0]} />
        </mesh>
      ))}
    </group>
  )
}
