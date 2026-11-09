import { stroke } from "./stroke"

type HairType = { style: number; color: string }

export const HairBack = ({ style, color }: HairType) => {
  if (style === 3)
    return (
      <path
        d="M28 44 C26 64 28 78 34 84 L66 84 C72 78 74 64 72 44 Z"
        fill={color}
        {...stroke}
      />
    )
  if (style === 6)
    return (
      <path
        d="M30 46 C28 60 30 70 36 74 L64 74 C70 70 72 60 70 46 Z"
        fill={color}
        {...stroke}
      />
    )
  return null
}

const CURLS = [
  [34, 30],
  [42, 23],
  [51, 21],
  [60, 24],
  [67, 31],
  [31, 38],
  [69, 39],
]

const PATHS: Record<number, string> = {
  0: "M29 42 C27 28 36 18 48 18 C60 17 72 24 71 38 C69 34 66 33 64 35 C63 30 59 29 56 32 C54 27 49 27 46 31 C43 27 38 29 37 34 C34 32 31 36 32 42 Z",
  2: "M29 42 C28 26 40 19 52 20 C64 21 72 28 71 40 C62 36 52 30 46 26 C42 32 36 36 29 42 Z",
  3: "M29 44 C28 28 38 20 50 20 C62 20 72 28 71 44 C66 38 60 34 54 33 C50 36 42 38 29 44 Z",
  5: "M30 38 C30 26 39 21 50 21 C61 21 70 26 70 38 C64 33 57 31 50 31 C43 31 36 33 30 38 Z",
  6: "M28 46 C27 28 38 20 50 20 C62 20 73 28 72 46 C68 40 64 34 58 32 C52 35 40 36 32 42 Z",
  7: "M30 40 L28 28 L36 31 L38 19 L45 27 L50 16 L55 27 L62 19 L64 31 L72 28 L70 40 C63 33 57 31 50 31 C43 31 37 33 30 40 Z",
}

export const HairFront = ({ style, color }: HairType) => {
  if (style === 1)
    return (
      <>
        <circle cx="50" cy="15" r="7" fill={color} {...stroke} />
        <path
          d="M29 40 C28 26 38 20 50 20 C62 20 72 26 71 40 C66 32 58 29 50 29 C42 29 34 32 29 40 Z"
          fill={color}
          {...stroke}
        />
      </>
    )
  if (style === 4)
    return (
      <g fill={color} {...stroke}>
        {CURLS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" />
        ))}
      </g>
    )
  return <path d={PATHS[style] ?? PATHS[7]} fill={color} {...stroke} />
}
