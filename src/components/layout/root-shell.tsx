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

  if (authRoutes.has(pathname)) {
    return <>{children}</>
  }

  return <AppLayout>{children}</AppLayout>
}
