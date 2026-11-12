"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { cn } from "cn"
import { XIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="drawer-overlay"
        className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs"
      />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "relative flex max-h-[calc(100dvh-3rem)] w-full max-w-lg translate-y-(--drawer-swipe-movement-y) flex-col overflow-hidden rounded-[28px] bg-popover text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/10 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:translate-y-[calc(100%+1rem)] data-starting-style:translate-y-[calc(100%+1rem)] data-swiping:duration-0",
            className
          )}
          {...props}
        >
          <div
            data-slot="drawer-handle"
            aria-hidden
            className="mx-auto mt-2.5 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
        className
      )}
      {...props}
    />
  )
}

function DrawerCloseButton() {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3 z-10 bg-popover/80 backdrop-blur"
        />
      }
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DrawerPrimitive.Close>
  )
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
}
