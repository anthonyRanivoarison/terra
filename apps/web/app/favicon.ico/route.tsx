import { ImageResponse } from "next/og"

export const dynamic = "force-static"

const MARK = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="14" r="8"/><path d="M5 16.5 9 12.5 12.5 16 20.5 8"/><circle cx="20.5" cy="8" r="2" fill="#ffffff" stroke="none"/></svg>'
)

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2563EB",
        borderRadius: 10,
      }}
    >
      <img src={`data:image/svg+xml,${MARK}`} width={34} height={34} alt="" />
    </div>,
    { width: 48, height: 48 }
  )
}
