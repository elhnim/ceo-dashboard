import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEO Dashboard",
  description: "Personal executive function support tool for daily focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>
          <SidebarProvider>
            <AppLayout>{children}</AppLayout>
          </SidebarProvider>
        </TooltipProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
