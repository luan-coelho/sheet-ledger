'use client'

import IconeEstimulos from '@/images/icone-estimulos.png'
import { Building2, CreditCard, FileText, Receipt, Settings, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

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

import { useActivePath } from '@/hooks/use-active-path'

import { routes } from '@/lib/routes'

// Menu items principais
const items = [
  {
    title: 'Planilhas',
    url: routes.frontend.admin.sheets,
    icon: FileText,
  },
  {
    title: 'Faturamentos',
    url: routes.frontend.admin.billings.index,
    icon: Receipt,
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
    title: 'Configurações',
    url: routes.frontend.admin.settings,
    icon: Settings,
  },
]

export function AppSidebar() {
  const { data: session } = useSession()
  const { isActive } = useActivePath()

  // Sidebar sempre usa o tema dark
  return (
    <div className="dark">
      <Sidebar className="bg-sidebar" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Image className="size-10 rounded-xl" src={IconeEstimulos} alt="Ícone Estímulos" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Grupo Estímulos</span>
              <span className="text-muted-foreground truncate text-xs">Neurodesenvolvimento</span>
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
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
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
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
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
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
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

        <SidebarFooter className="pointer-events-none">
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
