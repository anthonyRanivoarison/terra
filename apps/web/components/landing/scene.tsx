"use client"

import { Canvas } from "@react-three/fiber"

import { Arcs } from "./arcs"
import { CameraRig } from "./camera-rig"
import { Globe } from "./globe"
import { LabelProjector } from "./label-projector"
import { rig } from "./rig"
import { Satellites } from "./satellites"

type GlobeSceneType = {
  active: boolean
  compact: boolean
  reduced: boolean
  onReady: () => void
}

const GlobeScene = ({ active, compact, reduced, onReady }: GlobeSceneType) => (
  <Canvas
    flat
    frameloop={reduced ? "demand" : active ? "always" : "never"}
    dpr={[1, compact ? 1.5 : 1.75]}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    camera={{
      fov: rig.fov,
      near: 0.05,
      far: 100,
      position: [rig.px, rig.py, rig.pz],
    }}
  >
    <Globe compact={compact} onReady={onReady}>
      <Arcs compact={compact} />
    </Globe>
    <Satellites />
    <CameraRig />
    <LabelProjector />
  </Canvas>
)

export default GlobeScene
