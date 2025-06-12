"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex flex-1 items-center gap-2">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
            <span className="sr-only">Perfil do usuário</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
