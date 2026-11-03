import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { signUpOpen, socialProviders } from "@/lib/auth"
import { metadataFor } from "@/lib/seo"

export const metadata: Metadata = metadataFor({
  title: "Create an account",
  description:
    "Create a free Terra account: add your site, paste one script, and see traffic, revenue and AI crawlers.",
  path: "/auth/signup",
})

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  if (!signUpOpen) redirect("/auth/signin")
  return (
    <AuthShell mode="signup">
      <AuthForm mode="signup" providers={socialProviders} />
    </AuthShell>
  )
}
