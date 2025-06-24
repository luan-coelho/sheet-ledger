'use client'

import { RestrictedGoogleDriveManager } from '@/components/restricted-google-drive-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGoogleDriveConfigStatus } from '@/hooks/use-google-drive-config'
import { AlertCircle } from 'lucide-react'

export default function GoogleDrivePage() {
  const { data: config, isLoading, error } = useGoogleDriveConfigStatus()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Google Drive</h1>
            <p className="text-muted-foreground">Gerencie arquivos na pasta da aplicação</p>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Google Drive</h1>
            <p className="text-muted-foreground">Gerencie arquivos na pasta da aplicação</p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar configuração do Google Drive: {error.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!config?.isConfigured) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Google Drive</h1>
            <p className="text-muted-foreground">Gerencie arquivos na pasta da aplicação</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Drive não está configurado. Configure nas{' '}
              <a href="/admin/settings" className="underline hover:no-underline">
                configurações
              </a>{' '}
              primeiro.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Google Drive</h1>
          <p className="text-muted-foreground">Gerencie arquivos na pasta da aplicação</p>
        </div>

        <RestrictedGoogleDriveManager />
      </div>
    </div>
  )
}
