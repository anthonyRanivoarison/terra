"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import type { SocialProvider } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { SocialButtons } from "./social-buttons"

type AuthFormType = { mode: "signin" | "signup"; providers: SocialProvider[] }

const COPY = {
  signin: {
    title: "Sign in",
    subtitle: "Enter your credentials to access your account",
    submit: "Sign in",
    switchText: "No account?",
    switchLink: "Sign up",
    switchHref: "/auth/signup",
  },
  signup: {
    title: "Create an account",
    subtitle: "Add your site and see your first visitors in a minute",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/auth/signin",
  },
}

export const AuthForm = ({ mode, providers }: AuthFormType) => {
  const router = useRouter()
  const next = useSearchParams().get("next") ?? "/sites"
  const callbackUrl = next.startsWith("/") ? next : "/sites"
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const copy = COPY[mode]
  const signUp = mode === "signup"

  const onSubmit = (form: FormData) =>
    startTransition(async () => {
      setError(null)
      const email = String(form.get("email") ?? "")
      const password = String(form.get("password") ?? "")
      const result = signUp
        ? await authClient.signUp.email({
            name: String(form.get("name") ?? ""),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? "Something went wrong.")
        return
      }
      router.push(signUp ? "/sites/new" : callbackUrl)
      router.refresh()
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.035em] sm:text-4xl">
          {copy.title}
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>
      {providers.length > 0 && (
        <>
          <SocialButtons
            providers={providers}
            callbackUrl={callbackUrl}
            onError={setError}
          />
          <FieldSeparator className="text-xs tracking-wider uppercase">
            Or continue with
          </FieldSeparator>
        </>
      )}
      <form action={onSubmit} className="flex flex-col gap-6">
        <FieldGroup className="gap-5">
          {signUp && (
            <Field>
              <FieldLabel className="text-base" htmlFor="name">
                Name
              </FieldLabel>
              <Input
                id="name"
                className="h-12 rounded-xl px-3.5 text-base md:text-base"
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                required
              />
            </Field>
          )}
          <Field>
            <FieldLabel className="text-base" htmlFor="email">
              Email
            </FieldLabel>
            <Input
              id="email"
              className="h-12 rounded-xl px-3.5 text-base md:text-base"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel className="text-base" htmlFor="password">
              Password
            </FieldLabel>
            <Input
              id="password"
              className="h-12 rounded-xl px-3.5 text-base md:text-base"
              name="password"
              type="password"
              autoComplete={signUp ? "new-password" : "current-password"}
              placeholder={
                signUp ? "At least 10 characters" : "Enter your password"
              }
              minLength={10}
              required
            />
            {signUp && (
              <FieldDescription>Use 10 characters or more.</FieldDescription>
            )}
          </Field>
        </FieldGroup>
        {error && <FieldError>{error}</FieldError>}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl text-base font-semibold shadow-sm shadow-primary/20 transition-[scale,filter] duration-150 active:scale-[0.96]"
        >
          {pending && <Spinner />}
          {copy.submit}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link
          href={copy.switchHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {copy.switchLink}
        </Link>
      </p>
    </div>
  )
}
