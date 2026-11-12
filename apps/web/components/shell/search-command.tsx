"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowElbowDownLeftIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
} from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { buildGroups, filterGroups, type SearchItem } from "./search-items"
import type { SwitcherSite } from "./site-menu"
import { useSiteNav } from "./use-site-nav"

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1 font-sans text-[0.7rem] font-medium text-muted-foreground">
    {children}
  </kbd>
)

const noop = () => () => {}

type SearchCommandType = { sites: SwitcherSite[] }

export const SearchCommand = ({ sites }: SearchCommandType) => {
  const router = useRouter()
  const { setTheme } = useTheme()
  const nav = useSiteNav()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)
  const apple = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const groups = useMemo(
    () => filterGroups(buildGroups({ ...nav, sites }), query),
    [nav, sites, query]
  )
  const items = groups.flatMap((g) => g.items)

  const select = (item: SearchItem | undefined) => {
    if (!item) return
    setOpen(false)
    if (item.theme) setTheme(item.theme)
    else if (item.href) router.push(item.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")
      setIndex((i) => Math.min(items.length - 1, i + 1))
    else if (e.key === "ArrowUp") setIndex((i) => Math.max(0, i - 1))
    else if (e.key === "Enter") select(items[index])
    else return
    e.preventDefault()
  }

  const starts = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, x) => sum + x.items.length, 0)
  )

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 justify-between gap-2 px-2.5 font-normal text-muted-foreground xl:w-52"
      >
        <span className="flex items-center gap-2">
          <MagnifyingGlassIcon className="size-4" aria-hidden />
          <span className="max-xl:sr-only">Search…</span>
        </span>
        <kbd className="rounded-md border bg-muted px-1.5 font-sans text-[13px] text-foreground/80 max-xl:hidden">
          {apple ? "⌘K" : "Ctrl K"}
        </kbd>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          setQuery("")
          setIndex(0)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="top-20 translate-y-0 gap-0 overflow-hidden rounded-xl border-none bg-popover bg-clip-padding p-1 shadow-2xl ring-4 ring-border sm:max-w-lg"
        >
          <DialogTitle className="sr-only">Search Terra</DialogTitle>
          <div className="flex h-10 items-center gap-2 rounded-lg bg-input/30 px-2.5">
            <MagnifyingGlassIcon
              className="size-4 shrink-0 opacity-50"
              aria-hidden
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIndex(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Search pages, sites and commands…"
              aria-label="Search pages, sites and commands"
              aria-controls="search-results"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div
            id="search-results"
            role="listbox"
            className="max-h-[400px] overflow-y-auto py-2 pb-12 [scrollbar-width:none]"
          >
            {items.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <MagnifyingGlassMinusIcon
                  className="size-6 text-muted-foreground"
                  aria-hidden
                />
                <p className="font-medium">No results</p>
                <p className="text-sm text-muted-foreground">
                  Try a page name, a site or a domain.
                </p>
              </div>
            )}
            {groups.map((group, g) => (
              <div
                key={group.label}
                role="group"
                aria-label={group.label}
                className="p-1"
              >
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((item, j) => {
                  const i = starts[g]! + j
                  const Icon = item.icon
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="option"
                      aria-selected={i === index}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => select(item)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
                        i === index && "bg-muted"
                      )}
                    >
                      <Icon className="me-1 size-4 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="truncate text-muted-foreground">
                          {item.hint}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between gap-2 border-t bg-muted px-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="flex gap-1">
                  <Key>
                    <ArrowUpIcon className="size-3" aria-hidden />
                  </Key>
                  <Key>
                    <ArrowDownIcon className="size-3" aria-hidden />
                  </Key>
                </span>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <Key>
                  <ArrowElbowDownLeftIcon className="size-3" aria-hidden />
                </Key>
                Open
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Key>Esc</Key>
              Close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
