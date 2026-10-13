import { Suspense, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"

type AuthShellType = { mode: "signin" | "signup"; children: ReactNode }

export const AuthShell = ({ mode, children }: AuthShellType) => (
  <div className="flex min-h-svh bg-background text-foreground">
    <aside className="relative hidden flex-1 overflow-hidden lg:block">
      <Image
        src="/auth-pattern.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 0px"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
      <figure className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-12 text-white">
        <blockquote className="font-heading text-2xl leading-snug font-medium text-balance">
          &ldquo;Half the money I spend on advertising is wasted; the trouble is
          I don&apos;t know which half.&rdquo;
        </blockquote>
        <figcaption className="text-sm text-white/75">
          — John Wanamaker
        </figcaption>
      </figure>
    </aside>
    <main className="flex flex-1 flex-col px-6 py-8 sm:px-12">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Terra home">
          <Logo />
        </Link>
        <Link
          href={mode === "signin" ? "/auth/signup" : "/auth/signin"}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <Suspense>{children}</Suspense>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to the Terms of Service and Privacy Policy.
      </p>
    </main>
  </div>
)
