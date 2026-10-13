import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { socialProviders } from "@/lib/auth"
import { metadataFor } from "@/lib/seo"

export const metadata: Metadata = metadataFor({
  title: "Create an account",
  description:
    "Create a free Terra account: add your site, paste one script, and see traffic, revenue and AI crawlers.",
  path: "/auth/signup",
})

export default function SignUpPage() {
  return (
    <AuthShell mode="signup">
      <AuthForm mode="signup" providers={socialProviders} />
    </AuthShell>
  )
}
