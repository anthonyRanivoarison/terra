import { ImageResponse } from "next/og"
import { MarkSvg } from "@/components/brand/mark-svg"
import { brand } from "@/components/brand/palette"

export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: brand.night,
        borderRadius: 10,
      }}
    >
      <MarkSvg size={38} color={brand.lime} small />
    </div>,
    { width: 48, height: 48 }
  )
}
