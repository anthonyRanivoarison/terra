import { EnvelopeSimpleIcon } from "@phosphor-icons/react/ssr"
import { getReferrerIcon } from "@/lib/platform-icons"
import { hostOf } from "../sources"

type RowIconType = { channel: string }

export const RowIcon = ({ channel }: RowIconType) => (
  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/10">
    {channel === "Newsletter" ? (
      <EnvelopeSimpleIcon className="size-3.5" aria-hidden />
    ) : (
      getReferrerIcon(hostOf(channel), "size-3.5")
    )}
  </span>
)
