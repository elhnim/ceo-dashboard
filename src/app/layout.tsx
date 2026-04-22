import type { Metadata, Viewport } from "next"

import { AuthSessionProvider } from "@/components/auth/session-provider"
import { RootShell } from "@/components/layout/root-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { auth } from "@/lib/auth"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "CEO Dashboard",
  description: "Personal executive function support tool for daily focus.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CEO Dashboard",
  },
}

export const viewport: Viewport = {
  themeColor: "#6366f1",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AuthSessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <TooltipProvider>
              <SidebarProvider>
                <RootShell>{children}</RootShell>
              </SidebarProvider>
            </TooltipProvider>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
