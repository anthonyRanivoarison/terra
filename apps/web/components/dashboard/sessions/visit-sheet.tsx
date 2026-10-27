"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"

type VisitSheetType = {
  title: ReactNode
  visitorId: string
  href: string
  children: ReactNode
}

export const VisitSheet = ({
  title,
  visitorId,
  href,
  children,
}: VisitSheetType) => {
  const router = useRouter()
  return (
    <Sheet defaultOpen onOpenChange={(open) => !open && router.back()}>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="gap-1 border-b p-5 pe-12">
          <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {visitorId}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5">
          {children}
        </div>
        <div className="flex justify-end border-t p-4">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={href} />}
          >
            Open full page
            <ArrowUpRight aria-hidden data-icon="inline-end" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
