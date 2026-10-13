import { MarkSvg } from "@/components/brand/mark-svg"
import { brand, taglines } from "@/components/brand/palette"

const CHART =
  "M0 400 C 80 395 120 340 190 320 C 250 302 290 260 320 200 C 345 150 370 95 400 60"

const Grid = () => (
  <svg
    width="440"
    height="460"
    viewBox="0 0 440 460"
    style={{ position: "absolute", right: 0, bottom: 0 }}
  >
    <defs>
      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={brand.blue} stopOpacity="0.45" />
        <stop offset="1" stopColor={brand.blue} stopOpacity="0" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line
        key={`h${i}`}
        x1="0"
        x2="440"
        y1={40 + i * 60}
        y2={40 + i * 60}
        stroke={brand.sky}
        strokeOpacity="0.1"
      />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={`v${i}`}
        y1="0"
        y2="460"
        x1={i * 100}
        x2={i * 100}
        stroke={brand.sky}
        strokeOpacity="0.1"
      />
    ))}
    <path d={`${CHART} L 400 460 L 0 460 Z`} fill="url(#fill)" />
    <path d={CHART} fill="none" stroke={brand.sky} strokeWidth="4" />
    <circle cx="400" cy="60" r="9" fill={brand.sky} />
  </svg>
)

export const SocialImage = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      background: `radial-gradient(circle at 15% 10%, #16306B 0%, ${brand.navy} 55%)`,
      color: "#FFFFFF",
      padding: 80,
    }}
  >
    <Grid />
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <MarkSvg size={72} color={brand.sky} />
        <div style={{ fontSize: 60, fontWeight: 700, letterSpacing: -2 }}>
          Terra
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          maxWidth: 700,
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2.5,
        }}
      >
        {taglines.primary}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: 28,
          color: "#A9C4F5",
        }}
      >
        Privacy-first · Revenue attribution · AI crawlers
      </div>
    </div>
  </div>
)
