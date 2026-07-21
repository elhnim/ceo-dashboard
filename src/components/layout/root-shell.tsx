"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { AppLayout } from "@/components/layout/app-layout"

type RootShellProps = {
  children: ReactNode
}

const authRoutes = new Set(["/login"])

export function RootShell({ children }: RootShellProps) {
  const pathname = usePathname()

  // Founder Console and the login screen provide their own chrome and must not
  // be wrapped in the CEO Dashboard app shell.
  if (authRoutes.has(pathname) || pathname === "/console" || pathname.startsWith("/console/")) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}
