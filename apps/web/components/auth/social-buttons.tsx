"use client"

import { useState } from "react"
import Github from "@thesvg/react/github"
import Google from "@thesvg/react/google"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import type { SocialProvider } from "@/lib/auth"

const PROVIDERS = {
  github: {
    label: "GitHub",
    icon: <Github variant="mono" className="size-4" aria-hidden />,
  },
  google: { label: "Google", icon: <Google className="size-4" aria-hidden /> },
}

type SocialButtonsType = {
  providers: SocialProvider[]
  callbackUrl: string
  onError: (message: string) => void
}

export const SocialButtons = ({
  providers,
  callbackUrl,
  onError,
}: SocialButtonsType) => {
  const [loading, setLoading] = useState<SocialProvider | null>(null)

  const signIn = async (provider: SocialProvider) => {
    setLoading(provider)
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
      newUserCallbackURL: "/sites/new",
      errorCallbackURL: "/auth/signin",
    })
    if (error) {
      onError(error.message ?? "Sign in failed.")
      setLoading(null)
    }
  }

  return (
    <div className={cn("grid gap-3", providers.length > 1 && "grid-cols-2")}>
      {providers.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="h-12 rounded-xl text-base font-medium transition-[scale,background-color] duration-150 active:scale-[0.96]"
          disabled={loading !== null}
          onClick={() => signIn(provider)}
        >
          {loading === provider ? <Spinner /> : PROVIDERS[provider].icon}
          {PROVIDERS[provider].label}
        </Button>
      ))}
    </div>
  )
}
