import { INK } from "../identity"
import { stroke } from "./stroke"

type FacialType = { kind: number; color: string }

export const FacialHair = ({ kind, color }: FacialType) => {
  if (kind === 1)
    return (
      <path
        d="M33 53 C34 64 41 71 50 71 C59 71 66 64 67 53 C64 60 58 63 50 63 C42 63 36 60 33 53 Z"
        fill={color}
        {...stroke}
        strokeWidth={2}
      />
    )
  if (kind === 2)
    return (
      <path
        d="M42 57.5 C45 55 48 55.5 50 57 C52 55.5 55 55 58 57.5 C55 59.5 52 59 50 58.2 C48 59 45 59.5 42 57.5 Z"
        fill={color}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    )
  if (kind === 3)
    return (
      <g fill={INK} opacity="0.35">
        {[
          [40, 62],
          [44, 65],
          [50, 66.5],
          [56, 65],
          [60, 62],
          [37, 58],
          [63, 58],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" />
        ))}
      </g>
    )
  return null
}

export const Freckles = () => (
  <g fill="#b9764f" opacity="0.6">
    {[
      [35, 53],
      [38, 51.5],
      [39, 54.5],
      [61, 51.5],
      [62, 54.5],
      [65, 53],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.8" />
    ))}
  </g>
)

type CollarType = { kind: number; shirt: string; skin: string }

export const Collar = ({ kind, shirt, skin }: CollarType) => {
  if (kind === 1)
    return (
      <path d="M43 77 L50 88 L57 77" fill={skin} {...stroke} strokeWidth={2} />
    )
  if (kind === 2)
    return (
      <g {...stroke} strokeWidth={2}>
        <path d="M38 79 C42 86 58 86 62 79" fill="none" />
        <path d="M45 84 L44 94 M55 84 L56 94" fill="none" />
      </g>
    )
  if (kind === 3)
    return (
      <path
        d="M41 72 C44 80 56 80 59 72 L60 80 C55 86 45 86 40 80 Z"
        fill={shirt}
        {...stroke}
        strokeWidth={2}
      />
    )
  return <path d="M42 78 C45 82 55 82 58 78" fill="none" {...stroke} />
}
