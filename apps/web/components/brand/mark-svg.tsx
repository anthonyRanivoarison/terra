import { LOGO_CIRCLE, LOGO_DOT, LOGO_LINE } from "@/components/brand/logo"

type MarkSvgType = {
  size: number
  color: string
  strokeWidth?: number
}

export const MarkSvg = ({ size, color, strokeWidth = 2 }: MarkSvgType) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle {...LOGO_CIRCLE} />
    <path d={LOGO_LINE} />
    <circle {...LOGO_DOT} fill={color} stroke="none" />
  </svg>
)
