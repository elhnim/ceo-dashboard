"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BriefcaseBusinessIcon,
  CalendarIcon,
  CheckSquareIcon,
  HomeIcon,
  MailIcon,
  TargetIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationItems = [
  { href: "/", label: "My Day", icon: HomeIcon },
  { href: "/businesses", label: "Businesses", icon: BriefcaseBusinessIcon },
  { href: "/okrs", label: "OKRs", icon: TargetIcon },
  { href: "/tasks", label: "Tasks", icon: CheckSquareIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/email", label: "Email", icon: MailIcon },
] as const

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-4 px-3 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            CD
          </div>
          <div className="min-w-0 transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            <p className="truncate text-sm font-semibold">CEO Dashboard</p>
            <p className="truncate text-xs text-muted-foreground">
              Executive command center
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={isActiveRoute(pathname, href)}
                    render={<Link href={href} />}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4 pt-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        Phase 0 shell with placeholder modules for future releases.
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
