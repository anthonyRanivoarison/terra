"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, CreditCard, Globe, KeyRound, LogOut } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { authClient } from "@/lib/auth-client"

type UserMenuType = {
  name: string
  email: string
  image?: string | null
}

export const UserMenu = ({ name, email, image }: UserMenuType) => {
  const router = useRouter()
  const label = name.trim() || email
  const signOut = async () => {
    await authClient.signOut()
    router.push("/auth/signin")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-9 gap-2 px-1.5" />}
      >
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground uppercase">
          {image ? (
            <img src={image} alt="" className="size-full object-cover" />
          ) : (
            label.charAt(0)
          )}
        </span>
        <span className="max-w-40 truncate text-sm font-medium">{label}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate font-medium text-foreground">
              {label}
            </span>
            <span className="truncate text-xs font-normal">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/sites" />}>
          <Globe aria-hidden />
          Sites
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings/api-keys" />}>
          <KeyRound aria-hidden />
          API keys
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings/billing" />}>
          <CreditCard aria-hidden />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
