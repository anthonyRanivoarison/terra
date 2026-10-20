"use client"

import { useEffect, useMemo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Points,
  ShaderMaterial,
  Vector3,
  type Texture,
} from "three"
import { getArcs, sampleArc } from "./arcs"
import { CHIPS, GRID, buildAtlas, sourceOf } from "./atlas"
import { CHIP_FRAGMENT, CHIP_VERTEX } from "./chips-shader"
import { CITIES } from "./geo"
import { readouts, rig, tally } from "./rig"

type ChipsType = { perArc: number }

export const Chips = ({ perArc }: ChipsType) => {
  const arcs = getArcs()
  const gl = useThree((s) => s.gl)
  const [atlas, setAtlas] = useState<Texture | null>(null)

  useEffect(() => {
    let live = true
    buildAtlas()
      .then((texture) => live && setAtlas(texture))
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [])

  const chips = useMemo(
    () =>
      Array.from({ length: arcs.length * perArc }, (_, i) => {
        const arc = i % arcs.length
        return {
          arc,
          icon: i % CHIPS,
          t: ((i * 0.618) % 1) * 0.98,
          speed: 0.07 + ((i * 41) % 10) / 160,
          buyer: (i * 0.381) % 1 < CITIES[arc]!.rate * 1.6,
        }
      }),
    [arcs.length, perArc]
  )

  const object = useMemo(() => {
    if (!atlas) return null
    const geometry = new BufferGeometry()
    const count = chips.length
    const position = new BufferAttribute(new Float32Array(count * 3), 3)
    const gold = new BufferAttribute(new Float32Array(count), 1)
    const fade = new BufferAttribute(new Float32Array(count), 1)
    position.setUsage(DynamicDrawUsage)
    gold.setUsage(DynamicDrawUsage)
    fade.setUsage(DynamicDrawUsage)
    geometry.setAttribute("position", position)
    geometry.setAttribute(
      "aIcon",
      new BufferAttribute(
        Float32Array.from(chips, (c) => c.icon),
        1
      )
    )
    geometry.setAttribute("aGold", gold)
    geometry.setAttribute("aFade", fade)
    const material = new ShaderMaterial({
      vertexShader: CHIP_VERTEX,
      fragmentShader: CHIP_FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uAtlas: { value: atlas },
        uGrid: { value: GRID },
        uSize: { value: 34 },
        uOpacity: { value: 0 },
        uGoldColor: { value: new Color("#ffc04d") },
      },
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    return { points, material, geometry, position, gold, fade }
  }, [atlas, chips])

  useEffect(
    () => () => {
      object?.geometry.dispose()
      object?.material.dispose()
      atlas?.dispose()
    },
    [object, atlas]
  )

  const point = useMemo(() => new Vector3(), [])
  const frame = useMemo(() => ({ n: 0 }), [])

  useFrame((_, delta) => {
    if (!object) return
    const dt = Math.min(delta, 1 / 20) * (0.2 + 0.8 * rig.motion)
    const pos = object.position.array as Float32Array
    const gold = object.gold.array as Float32Array
    const fade = object.fade.array as Float32Array
    chips.forEach((c, i) => {
      c.t += dt * c.speed
      if (c.t >= 1) {
        c.t -= 1
        tally.visits += 1
        if (sourceOf(c.icon).ai) tally.ai += 1
      }
      sampleArc(arcs[c.arc]!, c.t, point)
      pos.set([point.x, point.y, point.z], i * 3)
      fade[i] = Math.min(1, c.t * 12, (1 - c.t) * 12)
      gold[i] = c.buyer
        ? rig.sales * Math.min(1, Math.max(0, (c.t - 0.4) * 3))
        : 0
    })
    object.position.needsUpdate = true
    object.gold.needsUpdate = true
    object.fade.needsUpdate = true
    object.material.uniforms.uOpacity!.value = rig.arcs
    object.material.uniforms.uSize!.value = 34 * gl.getPixelRatio()
    object.points.visible = rig.arcs > 0.01
    frame.n++
    if (frame.n % 8 === 0) {
      if (readouts.visits)
        readouts.visits.textContent = tally.visits.toLocaleString("en-US")
      if (readouts.ai)
        readouts.ai.textContent = tally.ai.toLocaleString("en-US")
    }
  })

  return object ? <primitive object={object.points} /> : null
}
