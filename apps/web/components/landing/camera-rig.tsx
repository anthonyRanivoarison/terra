"use client"
/* eslint-disable react-hooks/immutability -- r3f mutates the camera inside useFrame by design */

import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Vector3 } from "three"

import { pointer, rig } from "./rig"

export const CameraRig = () => {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const v = useMemo(
    () => ({
      target: new Vector3(),
      targetLook: new Vector3(),
      away: new Vector3(),
      awayLook: new Vector3(),
      look: new Vector3(rig.tx, rig.ty, rig.tz),
      pointer: new Vector3(),
    }),
    []
  )

  useEffect(() => {
    camera.position.set(rig.px, rig.py, rig.pz)
    camera.fov = rig.fov
    camera.updateProjectionMatrix()
    camera.lookAt(rig.tx, rig.ty, rig.tz)
    v.look.set(rig.tx, rig.ty, rig.tz)
  }, [camera, v])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    v.away.set(rig.away.px, rig.away.py, rig.away.pz)
    v.awayLook.set(rig.away.tx, rig.away.ty, rig.away.tz)
    v.target.set(rig.px, rig.py, rig.pz).lerp(v.away, rig.recede)
    v.targetLook.set(rig.tx, rig.ty, rig.tz).lerp(v.awayLook, rig.recede)

    const pointerEase = 1 - Math.exp(-dt * 2.5)
    v.pointer.x += (pointer.x - v.pointer.x) * pointerEase
    v.pointer.y += (pointer.y - v.pointer.y) * pointerEase
    v.target.x += v.pointer.x * 0.3 * rig.motion
    v.target.y += v.pointer.y * 0.18 * rig.motion

    const ease = rig.motion === 0 ? 1 : 1 - Math.exp(-dt * 4)
    camera.position.lerp(v.target, ease)
    v.look.lerp(v.targetLook, ease)
    camera.lookAt(v.look)
    if (Math.abs(camera.fov - rig.fov) > 0.01) {
      camera.fov += (rig.fov - camera.fov) * ease
      camera.updateProjectionMatrix()
    }
  })

  return null
}
