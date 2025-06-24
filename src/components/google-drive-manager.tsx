'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreateGoogleDriveFile,
  useCreateGoogleDriveFolder,
  useDeleteGoogleDriveFile,
  useDownloadGoogleDriveFile,
  useGoogleDriveFiles,
  useGoogleDriveSearch,
  useGoogleDriveStorage,
} from '@/hooks/use-google-drive'
import { DriveFile } from '@/services/google-drive-api'
import { ChevronLeft, Download, File, Folder, FolderPlus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface GoogleDriveManagerProps {
  className?: string
}

export default function GoogleDriveManager({ className }: GoogleDriveManagerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createType, setCreateType] = useState<'file' | 'folder'>('folder')
  const [newItemName, setNewItemName] = useState('')
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; name: string }>>([])

  // Hooks para dados
  const { data: files, isLoading: isLoadingFiles } = useGoogleDriveFiles(currentFolderId)
  const { data: searchResults, isLoading: isSearching } = useGoogleDriveSearch(
    searchQuery,
    showSearch && searchQuery.length > 0,
  )
  const { data: storageInfo } = useGoogleDriveStorage()

  // Hooks para mutations
  const createFile = useCreateGoogleDriveFile()
  const createFolder = useCreateGoogleDriveFolder()
  const deleteFile = useDeleteGoogleDriveFile()
  const downloadFile = useDownloadGoogleDriveFile()

  const displayFiles = showSearch ? searchResults : files

  // Função para navegar em pastas
  function navigateToFolder(folder: DriveFile) {
    if (folder.mimeType === 'application/vnd.google-apps.folder') {
      setFolderHistory(prev => [
        ...prev,
        { id: currentFolderId || 'root', name: currentFolderId ? 'Pasta Anterior' : 'Drive' },
      ])
      setCurrentFolderId(folder.id)
      setShowSearch(false)
    }
  }

  // Função para voltar
  function goBack() {
    if (folderHistory.length > 0) {
      const previous = folderHistory[folderHistory.length - 1]
      setFolderHistory(prev => prev.slice(0, -1))
      setCurrentFolderId(previous.id === 'root' ? undefined : previous.id)
    }
  }

  // Função para criar item
  function handleCreate() {
    if (!newItemName.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    const options = {
      name: newItemName,
      parents: currentFolderId ? [currentFolderId] : undefined,
    }

    if (createType === 'folder') {
      createFolder.mutate(options, {
        onSuccess: () => {
          setShowCreateDialog(false)
          setNewItemName('')
        },
      })
    } else {
      createFile.mutate(
        {
          ...options,
          content: '',
          mimeType: 'text/plain',
        },
        {
          onSuccess: () => {
            setShowCreateDialog(false)
            setNewItemName('')
          },
        },
      )
    }
  }

  // Função para download
  function handleDownload(file: DriveFile) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      toast.error('Não é possível baixar pastas')
      return
    }

    downloadFile.mutate(file.id, {
      onSuccess: blob => {
        // Criar URL e fazer download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
    })
  }

  // Função para formatar tamanho do arquivo
  function formatFileSize(bytes?: string) {
    if (!bytes) return '-'
    const size = parseInt(bytes)
    if (size === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return `${parseFloat((size / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Função para formatar data
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Google Drive</h2>
          {folderHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={goBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setShowSearch(e.target.value.length > 0)
              }}
              className="pl-10 w-64"
            />
          </div>

          {/* Botões de ação */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setCreateType('folder')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar {createType === 'folder' ? 'Pasta' : 'Arquivo'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={createType === 'folder' ? 'default' : 'outline'}
                    onClick={() => setCreateType('folder')}>
                    Pasta
                  </Button>
                  <Button variant={createType === 'file' ? 'default' : 'outline'} onClick={() => setCreateType('file')}>
                    Arquivo
                  </Button>
                </div>
                <Input
                  placeholder="Nome do item"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={!newItemName.trim()}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Informações de armazenamento */}
      {storageInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Armazenamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Usado: {formatFileSize(storageInfo.used)}</span>
              <span>Total: {formatFileSize(storageInfo.total)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${(parseInt(storageInfo.used) / parseInt(storageInfo.total)) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de arquivos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {showSearch ? `Resultados para "${searchQuery}"` : 'Arquivos e Pastas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFiles || isSearching ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {displayFiles?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {showSearch ? 'Nenhum arquivo encontrado' : 'Pasta vazia'}
                </div>
              ) : (
                displayFiles?.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Folder className="h-5 w-5 text-blue-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}

                      <div className="cursor-pointer flex-1" onClick={() => navigateToFolder(file)}>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(file.modifiedTime)} • {formatFileSize(file.size)}
                        </p>
                      </div>

                      {file.mimeType !== 'application/vnd.google-apps.folder' && (
                        <Badge variant="outline" className="text-xs">
                          {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {file.mimeType !== 'application/vnd.google-apps.folder' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          disabled={downloadFile.isPending}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir &quot;{file.name}?&quot; Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteFile.mutate(file.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
