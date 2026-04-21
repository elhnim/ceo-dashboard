"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ChevronDownIcon, LogOutIcon, SparklesIcon } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

type AppHeaderProps = {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const routeTitles: Record<string, string> = {
  "/": "My Day",
  "/businesses": "Businesses",
  "/okrs": "OKRs",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/email": "Email",
  "/settings": "Settings",
}

function getPageTitle(pathname: string) {
  if (pathname in routeTitles) {
    return routeTitles[pathname]
  }

  const matchingRoute = Object.keys(routeTitles)
    .filter((route) => route !== "/")
    .find((route) => pathname.startsWith(`${route}/`))

  return matchingRoute ? routeTitles[matchingRoute] : "CEO Dashboard"
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()

  const displayName = user?.name?.trim() || "CEO"
  const subtitle = user?.email?.trim() || "Microsoft SSO pending"
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              CEO Dashboard
            </p>
            <h1 className="truncate text-lg font-semibold">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            <SparklesIcon />
            Quick Capture
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-2 py-1.5 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              <Avatar size="default">
                <AvatarImage src={user?.image ?? undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {subtitle}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut({ callbackUrl: "/login" })
                }}
              >
                <LogOutIcon />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
