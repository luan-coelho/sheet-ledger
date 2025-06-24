'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Folder,
  FileText,
  RefreshCw,
  Plus,
  FolderPlus,
  Download,
  ExternalLink,
  Calendar,
  HardDrive,
} from 'lucide-react'
import { toast } from 'sonner'

interface RestrictedDriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
  thumbnailLink?: string
  iconLink?: string
}

interface RestrictedDriveFolder {
  id: string
  name: string
  parents?: string[]
  modifiedTime: string
}

interface DriveData {
  appRootFolder: RestrictedDriveFolder
  files: RestrictedDriveFile[]
  currentFolderId: string
}

export function RestrictedGoogleDriveManager() {
  const [data, setData] = useState<DriveData | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createType, setCreateType] = useState<'file' | 'folder'>('folder')
  const [createName, setCreateName] = useState('')

  // Carregar arquivos da pasta da aplicação
  async function loadFiles(folderId?: string) {
    setLoading(true)
    try {
      const url = folderId ? `/api/google-drive/restricted?folderId=${folderId}` : '/api/google-drive/restricted'

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        toast.success('Arquivos carregados com sucesso')
      } else {
        toast.error(result.message || 'Erro ao carregar arquivos')
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error)
      toast.error('Erro ao carregar arquivos')
    } finally {
      setLoading(false)
    }
  }

  // Criar arquivo ou pasta
  async function handleCreate() {
    if (!createName.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/google-drive/restricted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: createType,
          name: createName,
          parentFolderId: data?.currentFolderId !== data?.appRootFolder.id ? data?.currentFolderId : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${createType === 'folder' ? 'Pasta' : 'Arquivo'} criado com sucesso`)
        setCreateName('')
        setShowCreateForm(false)
        // Recarregar arquivos
        await loadFiles(data?.currentFolderId)
      } else {
        toast.error(result.message || 'Erro ao criar item')
      }
    } catch (error) {
      console.error('Erro ao criar item:', error)
      toast.error('Erro ao criar item')
    } finally {
      setCreating(false)
    }
  }

  // Navegar para uma pasta
  function navigateToFolder(folderId: string) {
    loadFiles(folderId)
  }

  // Voltar para pasta raiz
  function navigateToRoot() {
    loadFiles()
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

  // Carregar arquivos na inicialização
  useEffect(() => {
    loadFiles()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Google Drive - Pasta da Aplicação
        </CardTitle>
        <CardDescription>Gerenciar arquivos na pasta &quot;planilhas-app&quot; do Google Drive</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações da pasta raiz */}
        {data?.appRootFolder && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">{data.appRootFolder.name}</p>
                <p className="text-sm text-muted-foreground">Pasta raiz da aplicação</p>
              </div>
            </div>
            <Badge variant="secondary">ID: {data.appRootFolder.id}</Badge>
          </div>
        )}

        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => loadFiles(data?.currentFolderId)} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            {data?.currentFolderId !== data?.appRootFolder.id && (
              <Button onClick={navigateToRoot} variant="outline" size="sm">
                <Folder className="h-4 w-4" />
                Pasta Raiz
              </Button>
            )}
          </div>

          {/* <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreateType('folder')
                setShowCreateForm(true)
              }}
              size="sm">
              <FolderPlus className="h-4 w-4" />
              Nova Pasta
            </Button>

            <Button
              onClick={() => {
                setCreateType('file')
                setShowCreateForm(true)
              }}
              variant="outline"
              size="sm">
              <Plus className="h-4 w-4" />
              Novo Arquivo
            </Button>
          </div> */}
        </div>

        {/* Formulário de criação */}
        {showCreateForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Criar {createType === 'folder' ? 'Pasta' : 'Arquivo'}</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-name">Nome</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder={`Nome da ${createType === 'folder' ? 'pasta' : 'arquivo'}`}
              />
            </div>

            <Button onClick={handleCreate} disabled={creating || !createName.trim()} className="w-full">
              {creating ? 'Criando...' : `Criar ${createType === 'folder' ? 'Pasta' : 'Arquivo'}`}
            </Button>
          </div>
        )}

        <Separator />

        {/* Lista de arquivos */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando arquivos...</p>
          </div>
        ) : data?.files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos ({data?.files.length || 0})</h4>

            {data?.files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
