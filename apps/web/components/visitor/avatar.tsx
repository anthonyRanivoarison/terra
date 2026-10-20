import { cn } from "@workspace/ui/lib/utils"
import { INK, traits } from "./identity"
import { Brows, Eyes, Mouth } from "./parts/face"
import { HairBack, HairFront } from "./parts/hair"
import { stroke } from "./parts/stroke"

type VisitorAvatarType = { id: string; className?: string }

export const VisitorAvatar = ({ id, className }: VisitorAvatarType) => {
  const t = traits(id)
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("size-8 shrink-0 rounded-full", className)}
    >
      <rect width="100" height="100" fill={t.bg} />
      <g
        transform={`translate(50 54) scale(1.14) translate(-50 -50) rotate(${t.tilt} 50 60)`}
      >
        <HairBack style={t.hairStyle} color={t.hairColor} />
        <path
          d="M14 104 C16 86 30 79 43 77 L57 77 C70 79 84 86 86 104 Z"
          fill={t.shirt}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <path d="M43 66 L43 78 Q50 83 57 78 L57 66" fill={t.skin} {...stroke} />
        <path
          d="M43.5 68 Q50 74 56.5 68 L56.5 72 Q50 77 43.5 72 Z"
          fill="#000"
          opacity="0.12"
        />
        <path d="M31 47 C25 45 25 55 31 55" fill={t.skin} {...stroke} />
        <path d="M69 47 C75 45 75 55 69 55" fill={t.skin} {...stroke} />
        {t.extra === 0 && (
          <path
            d="M73.5 55.5 L73.5 60.5 M71 58 L76 58"
            fill="none"
            {...stroke}
            strokeWidth={1.8}
          />
        )}
        <path
          d="M31 40 C31 26 40 22 50 22 C60 22 69 26 69 40 L69 52 C69 63 60 70 50 70 C40 70 31 63 31 52 Z"
          fill={t.skin}
          {...stroke}
        />
        {t.blush && (
          <g fill="#f7b8b8" opacity="0.75">
            <ellipse cx="37" cy="56" rx="4" ry="2.4" />
            <ellipse cx="63" cy="56" rx="4" ry="2.4" />
          </g>
        )}
        <Eyes kind={t.eyes} />
        <Brows kind={t.brows} eyes={t.eyes} />
        <path
          d="M50 50 L48 55 L51 55.5"
          fill="none"
          {...stroke}
          strokeWidth={1.8}
        />
        <Mouth kind={t.mouth} />
        {t.extra === 1 ? (
          <g {...stroke}>
            <path
              d="M29 38 C29 22 39 16 50 16 C61 16 71 22 71 38 Z"
              fill={t.shirt === "#f4f4f4" ? "#9fc3f7" : t.shirt}
            />
            <path d="M28 38 L72 38 L72 43 L28 43 Z" fill="#fff" />
          </g>
        ) : (
          <HairFront style={t.hairStyle} color={t.hairColor} />
        )}
        {t.extra === 2 && (
          <g {...stroke}>
            <path
              d="M28 46 C26 26 38 16 50 16 C62 16 74 26 72 46"
              fill="none"
              strokeWidth={3}
            />
            <rect x="23" y="44" width="8" height="13" rx="3" fill={INK} />
            <rect x="69" y="44" width="8" height="13" rx="3" fill={INK} />
          </g>
        )}
      </g>
    </svg>
  )
}
