import { Suspense, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Logo } from "@/components/brand/logo"
import { signUpOpen } from "@/lib/auth"

type AuthShellType = { mode: "signin" | "signup"; children: ReactNode }

export const AuthShell = ({ mode, children }: AuthShellType) => (
  <div className="grid min-h-svh bg-background text-foreground lg:h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:overflow-hidden">
    <aside className="hidden min-h-0 p-3 pe-0 lg:block">
      <figure className="relative isolate h-full overflow-hidden rounded-2xl bg-black">
        <Image
          src="/auth-night.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 25vw, 0px"
          className="-z-10 object-cover object-top"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/25 to-transparent"
        />
        <figcaption className="flex h-full flex-col justify-end gap-2 p-8 text-white">
          <p className="font-heading text-2xl leading-snug font-medium text-balance">
            Every light is a visit. Terra shows you each one.
          </p>
          <p className="text-sm text-white/75">
            Free, open source and private by default.
          </p>
        </figcaption>
      </figure>
    </aside>
    <main className="flex min-h-0 min-w-0 flex-col px-4 py-4 sm:px-8">
      <header className="flex shrink-0 items-center justify-between gap-4">
        <Link href="/" aria-label="Terra home" className="rounded-md">
          <Logo />
        </Link>
        {(mode === "signup" || signUpOpen) && (
          <Link
            href={mode === "signin" ? "/auth/signup" : "/auth/signin"}
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </Link>
        )}
      </header>
      <div className="-mx-2 flex min-h-0 flex-1 overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="m-auto flex w-full max-w-sm flex-col py-6">
          <Suspense>{children}</Suspense>
        </div>
      </div>
      <p className="shrink-0 text-center text-xs text-muted-foreground">
        By continuing, you agree to the Terms of Service and Privacy Policy.
      </p>
    </main>
  </div>
)
