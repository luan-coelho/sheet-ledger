'use client'

import { UserAvatar } from '@/components/auth/user-avatar'
import { useHasHydrated, useThemeConfig } from '@/lib/theme-config'
import { BarChart3, CreditCard, FileText, Settings, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { routes } from '@/lib/routes'

// Menu items principais
const items = [
  {
    title: 'Planilhas',
    url: routes.frontend.admin.sheets,
    icon: FileText,
  },
  {
    title: 'Profissionais',
    url: routes.frontend.admin.professionals.index,
    icon: Users,
  },
  {
    title: 'Pacientes',
    url: routes.frontend.admin.patients.index,
    icon: Users,
  },
  {
    title: 'Responsáveis',
    url: routes.frontend.admin.guardians.index,
    icon: Shield,
  },
  {
    title: 'Planos de Saúde',
    url: routes.frontend.admin.healthPlans.index,
    icon: CreditCard,
  },
]

// Menu items de configuração
const configItems = [
  {
    title: 'Relatórios',
    url: routes.frontend.admin.home,
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    url: routes.frontend.admin.settings,
    icon: Settings,
  },
]

export function AppSidebar() {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const { config } = useThemeConfig()
  const [mounted, setMounted] = useState(false)
  const hasHydrated = useHasHydrated()

  // Efeito para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Aplicar classe dark ao sidebar se o tema for dark ou se a configuração darkSidebarInLightMode estiver ativada
  const shouldUseDarkSidebar =
    mounted && hasHydrated && (theme === 'dark' || (theme === 'light' && config.darkSidebarInLightMode))

  // Renderizar um placeholder durante a hidratação para evitar flash
  if (!mounted || !hasHydrated) {
    return (
      <div className="dark">
        <Sidebar className="bg-sidebar" variant="inset">
          {/* Conteúdo de placeholder idêntico à estrutura real */}
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Sheet Ledger</span>
                <span className="truncate text-xs text-muted-foreground">Gestão de Planilhas</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Estrutura mínima para manter o layout consistente durante a hidratação */}
            <SidebarRail />
          </SidebarContent>
        </Sidebar>
      </div>
    )
  }

  return (
    <div className={shouldUseDarkSidebar ? 'dark' : 'light'}>
      <Sidebar className="bg-sidebar" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Sheet Ledger</span>
              <span className="truncate text-xs text-muted-foreground">Gestão de Planilhas</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {configItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex items-center gap-2">
                  <UserAvatar size="sm" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name || 'Usuário'}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user?.email || 'Faça login'}
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </div>
  )
}
