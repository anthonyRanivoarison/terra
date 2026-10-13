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
        background: brand.blue,
      }}
    >
      <MarkSvg size={108} color="#FFFFFF" />
    </div>,
    size
  )
}
