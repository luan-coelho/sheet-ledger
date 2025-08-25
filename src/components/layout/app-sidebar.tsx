'use client'

import { BarChart3, Building2, Cloud, CreditCard, FileText, Settings, Shield, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { UserAvatar } from '@/components/auth/user-avatar'
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
    title: 'Empresas',
    url: routes.frontend.admin.companies.index,
    icon: Building2,
  },
  {
    title: 'Planos de Saúde',
    url: routes.frontend.admin.healthPlans.index,
    icon: CreditCard,
  },
  {
    title: 'Terapias',
    url: routes.frontend.admin.therapies.index,
    icon: Users,
  },
  {
    title: 'Google Drive',
    url: routes.frontend.admin.googleDrive.index,
    icon: Cloud,
  },
]

// Menu items de usuários (administração)
const userManagementItems = [
  {
    title: 'Usuários',
    url: routes.frontend.admin.users.index,
    icon: Users,
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

  // Sidebar sempre usa o tema dark
  return (
    <div className="dark">
      <Sidebar className="bg-sidebar" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Sistema</span>
              <span className="text-muted-foreground truncate text-xs">Gestão de Planilhas</span>
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
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userManagementItems.map(item => (
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
                    <span className="text-muted-foreground truncate text-xs">
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
