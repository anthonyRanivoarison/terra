"use client"

import { useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"

import { anchors, labelNodes, rig, type AnchorKind } from "./rig"

const strength = (kind: AnchorKind) =>
  kind === "channel" ? rig.labels : kind === "revenue" ? rig.revenue : rig.ai

export const LabelProjector = () => {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const v = useMemo(
    () => ({
      ndc: new Vector3(),
      toCamera: new Vector3(),
      normal: new Vector3(),
    }),
    []
  )

  useFrame(() => {
    for (const key in anchors) {
      const node = labelNodes[key]
      const anchor = anchors[key]
      if (!node || !anchor) continue
      const base = strength(anchor.kind)
      if (base < 0.01) {
        node.style.opacity = "0"
        continue
      }
      v.normal.copy(anchor.position).normalize()
      v.toCamera.copy(camera.position).sub(anchor.position).normalize()
      const facing = v.normal.dot(v.toCamera)
      const visible = Math.min(1, Math.max(0, (facing + 0.05) / 0.3))
      v.ndc.copy(anchor.position).project(camera)
      const x = (v.ndc.x * 0.5 + 0.5) * size.width
      const y = (-v.ndc.y * 0.5 + 0.5) * size.height
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      node.style.opacity = (base * visible).toFixed(3)
    }
  })

  return null
}
