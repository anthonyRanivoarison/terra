import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { UserMenu, type UserMenuType } from "@/components/app/user-menu"
import { LogoMark } from "@/components/brand/logo"
import type { Cta } from "@/components/marketing/cta"
import { HeaderNav } from "./header-nav"
import { SearchCommand } from "./search-command"
import { SiteMenu, type SwitcherSite } from "./site-menu"

type SiteHeaderType = {
  sites: SwitcherSite[]
  user: UserMenuType | null
  cta: Cta
}

export const SiteHeader = ({ sites, user, cta }: SiteHeaderType) => (
  <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
    <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-2 px-3 md:px-4">
      <Link
        href={user ? "/sites" : "/"}
        aria-label="Terra"
        className="grid size-8 shrink-0 place-content-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <LogoMark className="size-7" />
      </Link>
      <SiteMenu sites={sites} readOnly={!user} />
      <HeaderNav className="ms-2 hidden lg:flex" />
      <div className="ms-auto flex shrink-0 items-center gap-1.5">
        <SearchCommand sites={sites} />
        {user ? (
          <UserMenu {...user} />
        ) : (
          <Link
            href={cta.href}
            className={cn(buttonVariants({ size: "sm" }), "h-8 shrink-0")}
          >
            <span className="sm:hidden">Sign up</span>
            <span className="max-sm:hidden">{cta.label}</span>
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        )}
      </div>
    </div>
    <HeaderNav className="border-t px-3 py-1.5 lg:hidden" />
  </header>
)
