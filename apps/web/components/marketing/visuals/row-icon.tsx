import { Mail } from "lucide-react"
import { getReferrerIcon } from "@/lib/platform-icons"
import { hostOf } from "../sources"

type RowIconType = { channel: string }

export const RowIcon = ({ channel }: RowIconType) => (
  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/10">
    {channel === "Newsletter" ? (
      <Mail className="size-3.5" strokeWidth={2} aria-hidden />
    ) : (
      getReferrerIcon(hostOf(channel), "size-3.5")
    )}
  </span>
)
