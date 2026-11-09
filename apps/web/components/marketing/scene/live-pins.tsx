"use client"

import { useMemo, useRef } from "react"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Vector3, type Group } from "three"
import { VisitorAvatar } from "@/components/visitor/avatar"
import { visitorName } from "@/components/visitor/identity"
import { LIVE_VISITORS } from "../live-visitors"
import { toVector } from "./geo"
import { rig } from "./rig"

const RADIUS = 2.02

export const LivePins = () => {
  const pins = useMemo(
    () =>
      LIVE_VISITORS.map((v) => ({ ...v, at: toVector(v.lat, v.lon, RADIUS) })),
    []
  )
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const v = useMemo(
    () => ({ world: new Vector3(), normal: new Vector3(), eye: new Vector3() }),
    []
  )
  const group = useRef<Group>(null)

  useFrame(({ camera }) => {
    pins.forEach((pin, i) => {
      const node = nodes.current[i]
      if (!node || !group.current) return
      v.world.copy(pin.at).applyMatrix4(group.current.matrixWorld)
      v.normal.copy(v.world).normalize()
      v.eye.copy(camera.position).sub(v.world).normalize()
      const facing = Math.max(0, Math.min(1, v.normal.dot(v.eye) * 4))
      const shown = rig.live * facing
      node.style.opacity = shown.toFixed(3)
      node.style.transform = `translateY(${(1 - rig.live) * 8}px) scale(${0.9 + shown * 0.1})`
    })
  })

  return (
    <group ref={group}>
      {pins.map((pin, i) => (
        <Html
          key={pin.id}
          position={pin.at}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              nodes.current[i] = el
            }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-[oklch(0.14_0.02_264/80%)] py-1 pr-3 pl-1 whitespace-nowrap text-white opacity-0 shadow-[0_8px_24px_oklch(0_0_0/45%)] backdrop-blur-md"
          >
            <VisitorAvatar
              id={pin.id}
              className="size-7 ring-2 ring-white/80"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-medium">{visitorName(pin.id)}</span>
              <span className="text-[11px] text-white/65">
                {pin.city} · {pin.page}
              </span>
            </span>
          </div>
        </Html>
      ))}
    </group>
  )
}
