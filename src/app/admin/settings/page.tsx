'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSystemConfig, useThemeConfig, useHasHydrated } from '@/lib/theme-config'
import { Bell, Eye, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const { config: themeConfig, updateConfig: updateThemeConfig } = useThemeConfig()
  const { config, updateNotificationConfig, updatePrivacyConfig } = useSystemConfig()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const hasHydrated = useHasHydrated()

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !hasHydrated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Carregando preferências...</p>
        </div>
        <Separator />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Personalize a aparência e o comportamento do sistema.</p>
      </div>

      <Separator />

      <Tabs defaultValue="appearance" orientation="vertical" className="w-full flex-row items-start">
        <TabsList className="text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0">
          <TabsTrigger
            value="appearance"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Palette className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Aparência
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Bell className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Notificações
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Eye className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Privacidade
          </TabsTrigger>
        </TabsList>

        <div className="grow rounded-md border text-start">
          {/* Aba de Aparência */}
          <TabsContent value="appearance">
            <div className="px-4 py-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Tema</h3>
                  <p className="text-sm text-muted-foreground">Escolha o tema de cores para o sistema.</p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-selector">Tema do sistema</Label>
                    <Select value={theme} onValueChange={value => setTheme(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione um tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-sidebar">Sidebar escuro no tema claro</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Manter o sidebar escuro mesmo quando o tema geral estiver claro.
                      </p>
                    </div>
                    <Switch
                      id="dark-sidebar"
                      checked={themeConfig.darkSidebarInLightMode}
                      onCheckedChange={(checked: boolean) => updateThemeConfig({ darkSidebarInLightMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">Alto contraste</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Aumentar o contraste para melhor legibilidade.
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={themeConfig.highContrast}
                      onCheckedChange={(checked: boolean) => updateThemeConfig({ highContrast: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Acessibilidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajuste as configurações para melhorar a acessibilidade.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion">Reduzir movimento</Label>
                      <p className="text-[0.8rem] text-muted-foreground">Reduzir ou eliminar animações na interface.</p>
                    </div>
                    <Switch
                      id="reduced-motion"
                      checked={themeConfig.reducedMotion}
                      onCheckedChange={(checked: boolean) => updateThemeConfig({ reducedMotion: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho da fonte</Label>
                    <RadioGroup
                      value={themeConfig.fontSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') => updateThemeConfig({ fontSize: value })}
                      className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="font-small" />
                        <Label htmlFor="font-small" className="text-sm">
                          Pequeno
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="font-medium" />
                        <Label htmlFor="font-medium" className="text-base">
                          Médio
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="font-large" />
                        <Label htmlFor="font-large" className="text-lg">
                          Grande
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Notificações */}
          <TabsContent value="notifications">
            <div className="px-4 py-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Notificações</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure como você deseja receber notificações do sistema.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-notifications">Ativar notificações</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Receber notificações sobre atualizações e eventos importantes.
                      </p>
                    </div>
                    <Switch
                      id="enable-notifications"
                      checked={config.notifications.enableNotifications}
                      onCheckedChange={(checked: boolean) => updateNotificationConfig({ enableNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificações por e-mail</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Receber notificações importantes por e-mail.
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={config.notifications.emailNotifications}
                      disabled={!config.notifications.enableNotifications}
                      onCheckedChange={(checked: boolean) => updateNotificationConfig({ emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notifications">Notificações no navegador</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Receber notificações no navegador enquanto estiver usando o sistema.
                      </p>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={config.notifications.desktopNotifications}
                      disabled={!config.notifications.enableNotifications}
                      onCheckedChange={(checked: boolean) =>
                        updateNotificationConfig({ desktopNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-alerts">Alertas sonoros</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Reproduzir sons ao receber notificações importantes.
                      </p>
                    </div>
                    <Switch
                      id="sound-alerts"
                      checked={config.notifications.soundAlerts}
                      disabled={!config.notifications.enableNotifications}
                      onCheckedChange={(checked: boolean) => updateNotificationConfig({ soundAlerts: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Privacidade */}
          <TabsContent value="privacy">
            <div className="px-4 py-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Privacidade</h3>
                  <p className="text-sm text-muted-foreground">Gerencie suas configurações de privacidade e dados.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-usage-data">Compartilhar dados de uso</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Ajude a melhorar o sistema compartilhando dados anônimos de uso.
                      </p>
                    </div>
                    <Switch
                      id="share-usage-data"
                      checked={config.privacy.shareUsageData}
                      onCheckedChange={(checked: boolean) => updatePrivacyConfig({ shareUsageData: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="store-history">Armazenar histórico</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Manter histórico de ações para referência futura.
                      </p>
                    </div>
                    <Switch
                      id="store-history"
                      checked={config.privacy.storeHistory}
                      onCheckedChange={(checked: boolean) => updatePrivacyConfig({ storeHistory: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save">Salvar automaticamente</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Salvar automaticamente alterações em formulários e documentos.
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={config.privacy.autoSave}
                      onCheckedChange={(checked: boolean) => updatePrivacyConfig({ autoSave: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
