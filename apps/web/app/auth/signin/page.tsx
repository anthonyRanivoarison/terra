import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { socialProviders } from "@/lib/auth"
import { metadataFor } from "@/lib/seo"

export const metadata: Metadata = metadataFor({
  title: "Sign in",
  description:
    "Sign in to Terra to see where your visitors and revenue come from.",
  path: "/auth/signin",
})

export default function SignInPage() {
  return (
    <AuthShell mode="signin">
      <AuthForm mode="signin" providers={socialProviders} />
    </AuthShell>
  )
}
