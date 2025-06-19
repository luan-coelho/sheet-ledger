'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSystemConfig, useThemeConfig } from '@/lib/theme-config'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Eye, Palette } from 'lucide-react'

export default function SettingsPage() {
  const { config: themeConfig, updateConfig: updateThemeConfig } = useThemeConfig()
  const { config, updateNotificationConfig, updatePrivacyConfig } = useSystemConfig()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Personalize a aparência e o comportamento do sistema.</p>
      </div>

      <Card className="overflow-hidden">
        <Tabs defaultValue="appearance" orientation="vertical" className="flex flex-col md:flex-row">
          <div className="md:w-64 shrink-0 border-r border-border">
            <div className="py-2">
              <TabsList className="h-auto w-full flex flex-col items-stretch justify-start p-0 bg-transparent rounded-none">
                <TabsTrigger
                  value="appearance"
                  className="flex items-center justify-start gap-2 px-4 py-3 rounded-none border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted text-left">
                  <Palette className="h-4 w-4 shrink-0" />
                  <span>Aparência</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center justify-start gap-2 px-4 py-3 rounded-none border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted text-left">
                  <Bell className="h-4 w-4 shrink-0" />
                  <span>Notificações</span>
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="flex items-center justify-start gap-2 px-4 py-3 rounded-none border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted text-left">
                  <Eye className="h-4 w-4 shrink-0" />
                  <span>Privacidade</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 p-6">
            {/* Aba de Aparência */}
            <TabsContent value="appearance" className="mt-0 space-y-6 data-[state=active]:block">
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
                <p className="text-sm text-muted-foreground">Ajuste as configurações para melhorar a acessibilidade.</p>
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
            </TabsContent>

            {/* Aba de Notificações */}
            <TabsContent value="notifications" className="mt-0 space-y-6 data-[state=active]:block">
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
                    <p className="text-[0.8rem] text-muted-foreground">Receber notificações importantes por e-mail.</p>
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
                    onCheckedChange={(checked: boolean) => updateNotificationConfig({ desktopNotifications: checked })}
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
            </TabsContent>

            {/* Aba de Privacidade */}
            <TabsContent value="privacy" className="mt-0 space-y-6 data-[state=active]:block">
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
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
