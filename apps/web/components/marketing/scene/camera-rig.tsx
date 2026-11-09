"use client"

import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Vector3 } from "three"
import { pointer, rig } from "./rig"

export const CameraRig = () => {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const v = useMemo(
    () => ({
      target: new Vector3(),
      look: new Vector3(rig.tx, rig.ty, rig.tz),
      targetLook: new Vector3(),
      pointer: new Vector3(),
    }),
    []
  )

  useEffect(() => {
    camera.position.set(rig.px, rig.py, rig.pz)
    camera.lookAt(rig.tx, rig.ty, rig.tz)
  }, [camera])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    v.target.set(rig.px, rig.py, rig.pz)
    v.targetLook.set(rig.tx, rig.ty, rig.tz)
    const follow = 1 - Math.exp(-dt * 3)
    v.pointer.x += (pointer.x - v.pointer.x) * follow
    v.pointer.y += (pointer.y - v.pointer.y) * follow
    v.target.x += v.pointer.x * 0.35 * rig.motion
    v.target.y += v.pointer.y * 0.22 * rig.motion
    const ease = 1 - Math.exp(-dt * 4)
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
