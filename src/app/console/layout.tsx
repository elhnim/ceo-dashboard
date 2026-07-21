import type { ReactNode } from "react"
import type { Metadata } from "next"

import { ConsoleShell } from "@/components/console/console-shell"

export const metadata: Metadata = {
  title: "Founder Console",
  description: "Supervise a persistent AI team from a calm executive cockpit.",
}

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <ConsoleShell>{children}</ConsoleShell>
}
