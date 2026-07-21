"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ActivityIcon,
  BriefcaseIcon,
  GaugeIcon,
  HomeIcon,
  MessageSquareIcon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV = [
  { href: "/console", label: "Home", icon: HomeIcon },
  { href: "/console/decisions", label: "Decisions", icon: GaugeIcon },
  { href: "/console/officers", label: "Officers", icon: UsersIcon },
  { href: "/console/work", label: "Work", icon: BriefcaseIcon },
  { href: "/console/activity", label: "Activity", icon: ActivityIcon },
  { href: "/console/ea", label: "EA", icon: MessageSquareIcon },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/console") return pathname === "/console"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/40 px-4 py-6 md:flex">
        <Link href="/console" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            FC
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Founder Console</span>
            <span className="text-xs text-muted-foreground">Intelligent Organizations</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <p className="px-3 text-xs leading-5 text-muted-foreground">
          Supervising a persistent AI team. Inspect underlying sessions only when
          you choose to.
        </p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur md:hidden">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
          FC
        </span>
        <span className="text-sm font-semibold tracking-tight">Founder Console</span>
      </header>

      {/* Main content */}
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-10 md:pb-16 md:pt-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
