"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Globe, KeyRound, LogOut } from "lucide-react"
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
import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"

export type UserMenuType = {
  name: string
  email: string
  image?: string | null
}

export const userLabel = ({ name, email }: UserMenuType) => name.trim() || email

type UserAvatarType = UserMenuType & { className?: string }

export const UserAvatar = ({ className, ...user }: UserAvatarType) => (
  <span
    className={cn(
      "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground uppercase",
      className
    )}
  >
    {user.image ? (
      <img src={user.image} alt="" className="size-full object-cover" />
    ) : (
      userLabel(user).charAt(0)
    )}
  </span>
)

type UserMenuItemsType = UserMenuType & {
  align?: "start" | "end"
  side?: "top" | "bottom" | "right"
}

export const UserMenuItems = ({
  align = "end",
  side = "bottom",
  ...user
}: UserMenuItemsType) => {
  const router = useRouter()
  const signOut = async () => {
    await authClient.signOut()
    router.push("/auth/signin")
    router.refresh()
  }

  return (
    <DropdownMenuContent align={align} side={side} className="w-56">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium text-foreground">
            {userLabel(user)}
          </span>
          <span className="truncate text-xs font-normal">{user.email}</span>
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
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={signOut}>
        <LogOut aria-hidden />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

export const UserMenu = (user: UserMenuType) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<Button variant="ghost" className="h-9 gap-2 px-1.5" />}
    >
      <UserAvatar {...user} />
      <span className="max-w-40 truncate text-sm font-medium">
        {userLabel(user)}
      </span>
      <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
    </DropdownMenuTrigger>
    <UserMenuItems {...user} />
  </DropdownMenu>
)
