import { ImageResponse } from "next/og"

import { MarkSvg } from "@/components/brand/mark-svg"
import { brand } from "@/components/brand/palette"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brand.night,
      }}
    >
      <MarkSvg size={120} color={brand.lime} small />
    </div>,
    size
  )
}
