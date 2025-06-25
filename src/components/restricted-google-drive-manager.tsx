'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRestrictedGoogleDrive, type RestrictedDriveFile } from '@/hooks/use-restricted-google-drive'
import { Calendar, Download, ExternalLink, FileText, Folder, HardDrive, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const APP_ROOT_FOLDER_NAME = process.env.NODE_ENV === 'development' ? 'planilhas-app-dev' : 'planilhas-app'

export function RestrictedGoogleDriveManager() {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)

  const { data, isLoading, error, refetch, isRefetching } = useRestrictedGoogleDrive(currentFolderId)

  // Navegar para uma pasta
  function navigateToFolder(folderId: string) {
    setCurrentFolderId(folderId)
  }

  // Voltar para pasta raiz
  function navigateToRoot() {
    setCurrentFolderId(undefined)
  }

  // Atualizar dados
  async function handleRefresh() {
    try {
      await refetch()
      toast.success('Arquivos atualizados com sucesso')
    } catch {
      toast.error('Erro ao atualizar arquivos')
    }
  }

  // Formatar data
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Formatar tamanho do arquivo
  function formatFileSize(sizeString?: string) {
    if (!sizeString) return 'N/A'
    const size = parseInt(sizeString)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  // Obter ícone do arquivo
  function getFileIcon(mimeType: string) {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="h-5 w-5 text-blue-600" />
    }
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  // Exibir erro se houver
  if (error) {
    toast.error(error.message || 'Erro ao carregar arquivos')
  }

  const loading = isLoading || isRefetching

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Google Drive - Pasta da Aplicação
        </CardTitle>
        <CardDescription>
          Gerenciar arquivos na pasta &quot;{APP_ROOT_FOLDER_NAME}&quot; do Google Drive
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações da pasta raiz */}
        {data?.appRootFolder && (
          <div className="flex items-center justify-between p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium dark:text-white">{data.appRootFolder.name}</p>
                <p className="text-sm text-muted-foreground">Pasta raiz da aplicação</p>
              </div>
            </div>
            <Badge variant="secondary">ID: {data.appRootFolder.id}</Badge>
          </div>
        )}

        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            {currentFolderId && data?.appRootFolder && currentFolderId !== data.appRootFolder.id && (
              <Button onClick={navigateToRoot} variant="outline" size="sm">
                <Folder className="h-4 w-4" />
                Pasta Raiz
              </Button>
            )}
          </div>
        </div>

        {/* Lista de arquivos */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando arquivos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Erro ao carregar arquivos</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-4">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : !data?.files || data.files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos ({data.files.length})</h4>

            {data.files.map((file: RestrictedDriveFile) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.modifiedTime)}
                      </span>
                      {file.size && <span>{formatFileSize(file.size)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? (
                    <Button onClick={() => navigateToFolder(file.id)} size="sm" variant="outline">
                      <Folder className="h-4 w-4" />
                      Abrir
                    </Button>
                  ) : (
                    <>
                      {file.webViewLink && (
                        <Button onClick={() => window.open(file.webViewLink, '_blank')} size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                          Ver
                        </Button>
                      )}
                      {file.webContentLink && (
                        <Button onClick={() => window.open(file.webContentLink, '_blank')} size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                          Baixar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
