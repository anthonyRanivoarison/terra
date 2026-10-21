"use client"

import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { CameraRig } from "./camera-rig"
import { Earth, SUN_DIRECTION } from "./earth"
import { rig } from "./rig"
import { Stars } from "./stars"
import { Visits } from "./visits"
import { Chips } from "./chips"
import { LivePins } from "./live-pins"

type SceneType = { active: boolean; compact: boolean; onReady: () => void }

export const Scene = ({ active, compact, onReady }: SceneType) => {
  const sun = useMemo(() => SUN_DIRECTION.clone().multiplyScalar(12), [])

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{
        fov: rig.fov,
        near: 0.01,
        far: 200,
        position: [rig.px, rig.py, rig.pz],
      }}
      onCreated={({ gl }) => gl.setClearColor("#04060d")}
    >
      <ambientLight intensity={0.06} />
      <directionalLight position={sun} intensity={2.4} color="#f4f6ff" />
      <Stars count={compact ? 1400 : 3600} />
      <Suspense fallback={null}>
        <Earth onReady={onReady}>
          <Visits perArc={compact ? 3 : 5} />
          <Chips perArc={compact ? 1 : 2} />
          <LivePins />
        </Earth>
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
