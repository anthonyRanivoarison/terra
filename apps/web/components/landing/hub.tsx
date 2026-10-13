"use client"
/* eslint-disable react-hooks/immutability -- r3f mutates three.js objects inside useFrame by design */

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import {
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three"

import { HUB } from "./data"
import { latLonToVector, RADIUS } from "./geo"
import { PALETTE } from "./globe-materials"
import { hubWorld, rig } from "./rig"

const RINGS = [0, 0.5]

export const Hub = () => {
  const anchor = useRef<Group>(null)
  const rings = useRef<(Mesh | null)[]>([])
  const clock = useRef(0)
  const position = useMemo(
    () => latLonToVector(HUB.lat, HUB.lon, RADIUS * 1.006),
    []
  )
  const quaternion = useMemo(
    () =>
      new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1),
        position.clone().normalize()
      ),
    [position]
  )
  const materials = useMemo(
    () =>
      RINGS.map(
        () =>
          new MeshBasicMaterial({
            color: new Color(PALETTE.blue),
            transparent: true,
            depthWrite: false,
            side: DoubleSide,
          })
      ),
    []
  )

  useEffect(
    () => () => materials.forEach((material) => material.dispose()),
    [materials]
  )

  useFrame((_, delta) => {
    if (anchor.current)
      hubWorld.setFromMatrixPosition(anchor.current.matrixWorld)
    clock.current += Math.min(delta, 1 / 20) * rig.motion
    RINGS.forEach((offset, index) => {
      const t =
        rig.motion === 0
          ? 0.35 + offset * 0.5
          : (clock.current * 0.42 + offset) % 1
      const ring = rings.current[index]
      if (!ring) return
      ring.scale.setScalar(1 + t * 5)
      materials[index]!.opacity = (1 - t) * 0.55 * rig.intro
    })
  })

  return (
    <group ref={anchor} position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[0.045, 32]} />
        <meshBasicMaterial color={PALETTE.navy} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[0.02, 24]} />
        <meshBasicMaterial color={PALETTE.sky} />
      </mesh>
      {RINGS.map((offset, index) => (
        <mesh
          key={offset}
          ref={(node) => {
            rings.current[index] = node
          }}
          material={materials[index]}
        >
          <ringGeometry args={[0.05, 0.058, 48]} />
        </mesh>
      ))}
    </group>
  )
}
