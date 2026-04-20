"use client"

import type { ReactNode } from "react"
import { useSession } from "next-auth/react"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()

  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-muted/30">
        <AppHeader user={session?.user} />
        <div className="flex flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </>
  )
}
