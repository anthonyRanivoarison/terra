"use client"
/* eslint-disable react-hooks/immutability -- r3f mutates three.js objects and uniforms inside useFrame by design */

import { useEffect, useMemo, useRef, type ReactNode } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { BufferAttribute, BufferGeometry, Group } from "three"

import { HUB } from "./data"
import { landDots, latLonToVector, RADIUS } from "./geo"
import {
  createAtmosphereMaterial,
  createDotsMaterial,
  createSphereMaterial,
} from "./globe-materials"
import { rig } from "./rig"

const TILT = 0.42

type GlobeType = {
  compact: boolean
  onReady: () => void
  children?: ReactNode
}

export const Globe = ({ compact, onReady, children }: GlobeType) => {
  const pixelRatio = useThree((state) => state.viewport.dpr)
  const invalidate = useThree((state) => state.invalidate)
  const outer = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const clock = useRef(0)
  const frames = useRef(0)

  const baseYaw = useMemo(() => {
    const hub = latLonToVector(HUB.lat, HUB.lon)
    return -Math.atan2(hub.x, hub.z)
  }, [])

  const sphere = useMemo(createSphereMaterial, [])
  const atmosphere = useMemo(createAtmosphereMaterial, [])
  const dotsMaterial = useMemo(
    () => createDotsMaterial((compact ? 24 : 19) * pixelRatio),
    [compact, pixelRatio]
  )
  const dots = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      "position",
      new BufferAttribute(landDots(compact ? 1.7 : 1.15), 3)
    )
    return geometry
  }, [compact])

  useEffect(
    () => () => {
      sphere.dispose()
      atmosphere.dispose()
    },
    [sphere, atmosphere]
  )
  useEffect(() => () => dotsMaterial.dispose(), [dotsMaterial])
  useEffect(() => () => dots.dispose(), [dots])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    clock.current += dt * rig.motion
    const eased = 1 - Math.pow(1 - rig.intro, 3)
    if (inner.current) {
      const sway = Math.sin(clock.current * 0.05) * 0.55
      inner.current.rotation.y = baseYaw + sway + rig.spin - (1 - eased) * 0.9
    }
    if (outer.current) outer.current.scale.setScalar(0.92 + 0.08 * eased)
    dotsMaterial.uniforms.uOpacity!.value = eased
    frames.current++
    if (frames.current === 1) onReady()
    if (frames.current < 4) invalidate()
  })

  return (
    <group ref={outer} rotation={[TILT, 0, 0]}>
      <group ref={inner}>
        <mesh material={sphere}>
          <sphereGeometry
            args={[RADIUS, compact ? 64 : 96, compact ? 64 : 96]}
          />
        </mesh>
        <points geometry={dots} material={dotsMaterial} />
        {children}
      </group>
      <mesh material={atmosphere} scale={1.16}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
      </mesh>
    </group>
  )
}
