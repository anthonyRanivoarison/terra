import { INK } from "../identity"
import { stroke } from "./stroke"

export const Eyes = ({ kind }: { kind: number }) => {
  if (kind === 3)
    return (
      <g fill="none" {...stroke}>
        <path d="M38 47 Q41.5 50 45 47" />
        <path d="M55 47 Q58.5 50 62 47" />
      </g>
    )
  if (kind === 4)
    return (
      <g {...stroke}>
        <circle cx="41.5" cy="47" r="6" fill="none" />
        <circle cx="58.5" cy="47" r="6" fill="none" />
        <path d="M47.5 47 L52.5 47" fill="none" />
        <circle cx="41.5" cy="47.5" r="1.8" fill={INK} stroke="none" />
        <circle cx="58.5" cy="47.5" r="1.8" fill={INK} stroke="none" />
      </g>
    )
  if (kind === 5)
    return (
      <g {...stroke}>
        <path d="M33 43 L67 43" fill="none" />
        <path d="M34 43 L48 43 L47 50 C46 53 36 53 35 50 Z" fill={INK} />
        <path d="M52 43 L66 43 L65 50 C64 53 54 53 53 50 Z" fill={INK} />
      </g>
    )
  const r = kind === 2 ? 2.8 : 2.1
  return (
    <g fill={INK}>
      <circle cx="41.5" cy="47.5" r={r} />
      <circle cx="58.5" cy="47.5" r={r} />
    </g>
  )
}

export const Brows = ({ kind, eyes }: { kind: number; eyes: number }) => {
  if (kind === 0 || eyes === 5) return null
  const y = eyes === 4 ? 38 : 41
  const d =
    kind === 1
      ? `M37 ${y} Q41.5 ${y - 2.5} 46 ${y} M54 ${y} Q58.5 ${y - 2.5} 63 ${y}`
      : `M37 ${y - 1} L46 ${y + 0.5} M54 ${y + 0.5} L63 ${y - 1}`
  return <path d={d} fill="none" {...stroke} strokeWidth={2} />
}

export const Mouth = ({ kind }: { kind: number }) => {
  if (kind === 0)
    return <path d="M44 60 Q50 65 56 60" fill="none" {...stroke} />
  if (kind === 1) return <path d="M45.5 61 L54.5 61" fill="none" {...stroke} />
  if (kind === 2)
    return (
      <path
        d="M44 59 Q50 59 56 59 Q55 66 50 66 Q45 66 44 59 Z"
        fill="#fff"
        {...stroke}
        strokeWidth={2.2}
      />
    )
  return (
    <path
      d="M44.5 60.5 Q50 58.5 55.5 60.5 Q50 64 44.5 60.5 Z"
      fill="#f4a3a8"
      stroke={INK}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  )
}
