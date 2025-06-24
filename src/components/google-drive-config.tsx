'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, Settings, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { 
  useGoogleDriveConfigStatus, 
  useConfigureGoogleDrive, 
  useRemoveGoogleDriveConfig,
  useStartGoogleDriveAuth 
} from '@/hooks/use-google-drive-config'
// Função utilitária para formatar data
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function GoogleDriveConfig() {
  const [authCode, setAuthCode] = useState('')
  const [isManualConfig, setIsManualConfig] = useState(false)
  
  const { data: status, isLoading: statusLoading, error: statusError } = useGoogleDriveConfigStatus()
  const configureGoogleDrive = useConfigureGoogleDrive()
  const removeConfig = useRemoveGoogleDriveConfig()
  const startAuth = useStartGoogleDriveAuth()

  // Monitorar parâmetros da URL para código de autorização
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code && !status?.isConfigured) {
      setAuthCode(code)
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [status?.isConfigured])

  function handleStartAuth() {
    startAuth.mutate()
  }

  function handleManualAuth() {
    setIsManualConfig(true)
  }

  function handleConfigureWithCode() {
    if (!authCode.trim()) return
    
    configureGoogleDrive.mutate(authCode, {
      onSuccess: () => {
        setAuthCode('')
        setIsManualConfig(false)
      },
      onError: (error) => {
        // Se for erro de código inválido, limpar o campo
        if (error.message?.includes('inválido') || error.message?.includes('expirado')) {
          setAuthCode('')
        }
      }
    })
  }

  function handleRemoveConfig() {
    removeConfig.mutate()
  }

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Google Drive
          </CardTitle>
          <CardDescription>
            Configure o acesso ao Google Drive para toda a aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (statusError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Erro ao carregar configurações</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Google Drive
        </CardTitle>
        <CardDescription>
          Configure o acesso ao Google Drive para toda a aplicação
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status da Configuração */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status?.isConfigured ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {status?.isConfigured ? 'Configurado' : 'Não Configurado'}
              </p>
              {status?.isConfigured && status.accountEmail && (
                <p className="text-sm text-muted-foreground">
                  Conta: {status.accountEmail}
                </p>
              )}
              {status?.isConfigured && status.configuredAt && (
                <p className="text-xs text-muted-foreground">
                  Configurado em: {formatDate(new Date(status.configuredAt))}
                </p>
              )}
            </div>
          </div>
          
          <Badge variant={status?.isConfigured ? 'default' : 'destructive'}>
            {status?.isConfigured ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <Separator />

        {!status?.isConfigured ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Configurar Google Drive</h4>
              <p className="text-sm text-muted-foreground">
                Conecte uma conta Google Drive para permitir que a aplicação gerencie arquivos e pastas.
              </p>
            </div>

            {!isManualConfig ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleStartAuth}
                  disabled={startAuth.isPending}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {startAuth.isPending ? 'Abrindo...' : 'Autorizar com Google'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleManualAuth}
                >
                  Configuração Manual
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-code">Código de Autorização</Label>
                  <Input
                    id="auth-code"
                    type="text"
                    placeholder="Cole aqui o código obtido no Google"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    disabled={configureGoogleDrive.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acesse a URL de autorização do Google, autorize a aplicação e cole o código aqui.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfigureWithCode}
                    disabled={!authCode.trim() || configureGoogleDrive.isPending}
                  >
                    {configureGoogleDrive.isPending ? 'Configurando...' : 'Configurar'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsManualConfig(false)
                      setAuthCode('')
                    }}
                    disabled={configureGoogleDrive.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Google Drive Conectado</h4>
              <p className="text-sm text-muted-foreground">
                A aplicação está conectada ao Google Drive e pode gerenciar arquivos e pastas.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Remover Configuração
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Configuração</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover a configuração do Google Drive? 
                    Isso impedirá que a aplicação acesse os arquivos até que seja reconfigurada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRemoveConfig}
                    disabled={removeConfig.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {removeConfig.isPending ? 'Removendo...' : 'Remover'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 