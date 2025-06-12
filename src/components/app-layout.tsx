"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex flex-col gap-4 p-4 pt-4 pb-20">
          <div className="flex-1 rounded-xl bg-muted/50 min-h-[calc(100vh-8rem)]">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-40 md:left-[var(--sidebar-width)] md:peer-data-[state=collapsed]:left-[var(--sidebar-width-icon)]">
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
