"use client"

import { useEffect, useMemo, useRef, type ReactNode } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import {
  AdditiveBlending,
  BackSide,
  Color,
  Group,
  Mesh,
  SRGBColorSpace,
  ShaderMaterial,
  Vector3,
  type Texture,
} from "three"
import {
  ATMOSPHERE_FRAGMENT,
  ATMOSPHERE_VERTEX,
  EARTH_FRAGMENT,
  EARTH_VERTEX,
} from "./earth-shaders"
import { rig } from "./rig"

export const SUN_DIRECTION = new Vector3(1, 0.28, 0.55).normalize()

const TEX = "/textures/earth"

type EarthType = { onReady?: () => void; children?: ReactNode }

export const Earth = ({ onReady, children }: EarthType) => {
  const [day, night, specular, clouds] = useTexture([
    `${TEX}/earth_atmos_2048.jpg`,
    `${TEX}/earth_lights_2048.png`,
    `${TEX}/earth_specular_2048.jpg`,
    `${TEX}/earth_clouds_1024.png`,
  ]) as [Texture, Texture, Texture, Texture]
  const gl = useThree((state) => state.gl)

  useMemo(() => {
    day.colorSpace = SRGBColorSpace
    night.colorSpace = SRGBColorSpace
    clouds.colorSpace = SRGBColorSpace
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy())
    day.anisotropy = aniso
    night.anisotropy = aniso
  }, [day, night, clouds, gl])

  const earthMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: EARTH_VERTEX,
        fragmentShader: EARTH_FRAGMENT,
        uniforms: {
          uDay: { value: day },
          uNight: { value: night },
          uSpecular: { value: specular },
          uSun: { value: SUN_DIRECTION },
          uRim: { value: new Color("#4f7dff") },
          uCity: { value: new Color("#c9d6ff") },
        },
      }),
    [day, night, specular]
  )

  const atmosphereMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        uniforms: {
          uSun: { value: SUN_DIRECTION },
          uColor: { value: new Color("#3f6dff") },
        },
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  )

  useEffect(
    () => () => {
      earthMaterial.dispose()
      atmosphereMaterial.dispose()
    },
    [earthMaterial, atmosphereMaterial]
  )

  useEffect(() => {
    onReady?.()
  }, [onReady])

  const scaleGroup = useRef<Group>(null)
  const group = useRef<Group>(null)
  const cloudMesh = useRef<Mesh>(null)
  const spin = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    spin.current += dt * 0.008 * rig.motion
    if (group.current) {
      const eased = 1 - Math.pow(1 - rig.intro, 3)
      group.current.rotation.y = spin.current - (1 - eased) * 2.6
      scaleGroup.current?.scale.setScalar(0.55 + 0.45 * eased)
    }
    if (cloudMesh.current)
      cloudMesh.current.rotation.y += dt * 0.004 * rig.motion
  })

  return (
    <group ref={scaleGroup} rotation={[0.18, 0, -0.41]}>
      <group ref={group}>
        <mesh material={earthMaterial}>
          <sphereGeometry args={[2, 128, 128]} />
        </mesh>
        <mesh ref={cloudMesh} scale={1.012}>
          <sphereGeometry args={[2, 96, 96]} />
          <meshLambertMaterial
            map={clouds}
            alphaMap={clouds}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
        {children}
      </group>
      <mesh material={atmosphereMaterial} scale={1.1}>
        <sphereGeometry args={[2, 96, 96]} />
      </mesh>
    </group>
  )
}
