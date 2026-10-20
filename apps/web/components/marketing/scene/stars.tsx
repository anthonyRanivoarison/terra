"use client"

import { useEffect, useMemo } from "react"
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
} from "three"

const seeded = (seed: number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type StarsType = { count: number }

export const Stars = ({ count }: StarsType) => {
  const points = useMemo(() => {
    const random = seeded(2026)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const cool = new Color("#c9d6ff")
    const warm = new Color("#ffe6c8")
    const tint = new Color()
    for (let i = 0; i < count; i++) {
      const u = random() * 2 - 1
      const theta = random() * Math.PI * 2
      const r = 55 + random() * 40
      const s = Math.sqrt(1 - u * u)
      positions.set(
        [r * s * Math.cos(theta), r * u, r * s * Math.sin(theta)],
        i * 3
      )
      tint
        .copy(random() > 0.3 ? cool : warm)
        .multiplyScalar(0.3 + Math.pow(random(), 3) * 0.7)
      colors.set([tint.r, tint.g, tint.b], i * 3)
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(positions, 3))
    geometry.setAttribute("color", new BufferAttribute(colors, 3))
    return new Points(
      geometry,
      new PointsMaterial({
        size: 1.6,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    )
  }, [count])

  useEffect(
    () => () => {
      points.geometry.dispose()
      points.material.dispose()
    },
    [points]
  )

  return <primitive object={points} />
}
