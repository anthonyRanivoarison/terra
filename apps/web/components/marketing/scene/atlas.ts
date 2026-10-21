import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { CanvasTexture, SRGBColorSpace } from "three"
import { VisitorAvatar } from "@/components/visitor/avatar"
import { getReferrerIcon } from "@/lib/platform-icons"
import { LIVE_VISITORS } from "../live-visitors"
import { SOURCES } from "../sources"

export const CELL = 128
export const CHIPS = SOURCES.length * 2
export const GRID = Math.ceil(Math.sqrt(CHIPS))

export const sourceOf = (chip: number) => SOURCES[chip % SOURCES.length]!

const load = (svg: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })

const sized = (svg: string, size: number, color = "#eef1ff") =>
  svg.replace(
    /^<svg([^>]*)>/,
    (_, attrs: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" color="${color}"${attrs.replace(/\s(xmlns|width|height|color)="[^"]*"/g, "")}>`
  )

const avatar = (i: number) =>
  sized(
    renderToStaticMarkup(
      createElement(VisitorAvatar, {
        id: LIVE_VISITORS[i]?.id ?? `visitor-${i * 7919}`,
      })
    ),
    128
  )

const badge = (i: number) =>
  sized(renderToStaticMarkup(getReferrerIcon(sourceOf(i).host, "size-8")), 64)

export const buildAtlas = async () => {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = CELL * GRID
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  const ids = Array.from({ length: CHIPS }, (_, i) => i)
  const [faces, badges] = await Promise.all([
    Promise.all(ids.map((i) => load(avatar(i)))),
    Promise.all(ids.map((i) => load(badge(i)))),
  ])
  ids.forEach((i) => {
    const x = (i % GRID) * CELL
    const y = Math.floor(i / GRID) * CELL
    const r = CELL / 2 - 8
    const cx = x + CELL / 2 - 6
    const cy = y + CELL / 2 - 6
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(faces[i]!, cx - r, cy - r, r * 2, r * 2)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
    ctx.lineWidth = 5
    ctx.strokeStyle = "rgba(235, 240, 255, 0.9)"
    ctx.stroke()
    const bx = x + CELL - 30
    const by = y + CELL - 30
    ctx.beginPath()
    ctx.arc(bx, by, 24, 0, Math.PI * 2)
    ctx.fillStyle = "#0d1430"
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = "rgba(235, 240, 255, 0.9)"
    ctx.stroke()
    ctx.drawImage(badges[i]!, bx - 14, by - 14, 28, 28)
  })
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
