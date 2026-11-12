import { ORBIT, ORBIT_SMALL } from "@/components/brand/logo-paths"

type MarkSvgType = {
  size: number
  color: string
  small?: boolean
}

export const MarkSvg = ({ size, color, small = false }: MarkSvgType) => {
  const art = small ? ORBIT_SMALL : ORBIT
  const [, , w, h] = art.viewBox.split(" ").map(Number)
  return (
    <svg
      width={size}
      height={Math.round((size * h) / w)}
      viewBox={art.viewBox}
      fill={color}
    >
      {art.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
