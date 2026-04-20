import type { ReactNode } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { requireAuth } from "@/lib/auth"
import { SidebarInset } from "@/components/ui/sidebar"

type AppLayoutProps = {
  children: ReactNode
}

export async function AppLayout({ children }: AppLayoutProps) {
  const session = await requireAuth()

  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-muted/30">
        <AppHeader user={session.user} />
        <div className="flex flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </>
  )
}
