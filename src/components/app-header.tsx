'use client'

import { UserMenu } from '@/components/auth/user-menu'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Bell } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
          </Button>

          <ThemeToggle />

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
