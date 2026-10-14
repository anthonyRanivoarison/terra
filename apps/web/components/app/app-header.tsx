import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/shell/theme-toggle"
import { requireUser } from "@/lib/session"
import { UserMenu } from "./user-menu"

export const AppHeader = async () => {
  const { user } = await requireUser()
  return (
    <header className="relative z-10 flex h-14 w-full items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link
        href="/sites"
        aria-label="Terra, all sites"
        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Logo className="text-lg" markClassName="text-primary" />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} image={user.image} />
      </div>
    </header>
  )
}
