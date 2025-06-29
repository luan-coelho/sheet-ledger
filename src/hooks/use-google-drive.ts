import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  CreateFileOptions,
  CreateFolderOptions,
  createGoogleDriveApi,
  DriveFile,
  googleDriveQueryKeys,
  UpdateFileOptions,
} from '@/services/google-drive-api'

// Hook para obter o serviço do Google Drive
function useGoogleDriveApi() {
  return createGoogleDriveApi()
}

// Hook para listar arquivos e pastas
export function useGoogleDriveFiles(folderId?: string, enabled: boolean = true) {
  const api = useGoogleDriveApi()

  return useQuery({
    queryKey: googleDriveQueryKeys.filesList(folderId),
    queryFn: () => api.listFiles(folderId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar arquivos
export function useGoogleDriveSearch(query: string, enabled: boolean = true) {
  const api = useGoogleDriveApi()

  return useQuery({
    queryKey: googleDriveQueryKeys.search(query),
    queryFn: () => api.searchFiles(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para obter detalhes de um arquivo
export function useGoogleDriveFile(fileId: string, enabled: boolean = true) {
  const api = useGoogleDriveApi()

  return useQuery({
    queryKey: googleDriveQueryKeys.file(fileId),
    queryFn: () => api.getFile(fileId),
    enabled: enabled && !!fileId,
  })
}

// Hook para obter informações de armazenamento
export function useGoogleDriveStorage() {
  const api = useGoogleDriveApi()

  return useQuery({
    queryKey: googleDriveQueryKeys.storage(),
    queryFn: () => api.getStorageInfo(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para criar arquivo
export function useCreateGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: CreateFileOptions) => api.createFile(options),
    onSuccess: (newFile, variables) => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      // Adicionar o novo arquivo ao cache se estiver listando a pasta pai
      if (variables.parents?.[0]) {
        const queryKey = googleDriveQueryKeys.filesList(variables.parents[0])
        queryClient.setQueryData(queryKey, (oldData: DriveFile[] | undefined) => {
          return oldData ? [newFile, ...oldData] : [newFile]
        })
      }

      toast.success('Arquivo criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar arquivo: ${error.message}`)
    },
  })
}

// Hook para criar pasta
export function useCreateGoogleDriveFolder() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: CreateFolderOptions) => api.createFolder(options),
    onSuccess: (newFolder, variables) => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      // Adicionar a nova pasta ao cache se estiver listando a pasta pai
      if (variables.parents?.[0]) {
        const queryKey = googleDriveQueryKeys.filesList(variables.parents[0])
        queryClient.setQueryData(queryKey, (oldData: DriveFile[] | undefined) => {
          const folderAsFile: DriveFile = {
            ...newFolder,
            mimeType: 'application/vnd.google-apps.folder',
          }
          return oldData ? [folderAsFile, ...oldData] : [folderAsFile]
        })
      }

      toast.success('Pasta criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar pasta: ${error.message}`)
    },
  })
}

// Hook para atualizar arquivo
export function useUpdateGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, options }: { fileId: string; options: UpdateFileOptions }) =>
      api.updateFile(fileId, options),
    onSuccess: updatedFile => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      // Atualizar o cache do arquivo específico
      queryClient.setQueryData(googleDriveQueryKeys.file(updatedFile.id), updatedFile)

      toast.success('Arquivo atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar arquivo: ${error.message}`)
    },
  })
}

// Hook para renomear arquivo ou pasta
export function useRenameGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) => api.rename(fileId, newName),
    onSuccess: renamedFile => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      // Atualizar o cache do arquivo específico
      queryClient.setQueryData(googleDriveQueryKeys.file(renamedFile.id), renamedFile)

      toast.success('Item renomeado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao renomear: ${error.message}`)
    },
  })
}

// Hook para mover arquivo ou pasta
export function useMoveGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, newParentId, oldParentId }: { fileId: string; newParentId: string; oldParentId?: string }) =>
      api.move(fileId, newParentId, oldParentId),
    onSuccess: () => {
      // Invalidar todas as listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      toast.success('Item movido com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao mover: ${error.message}`)
    },
  })
}

// Hook para copiar arquivo
export function useCopyGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, name, parentIds }: { fileId: string; name: string; parentIds?: string[] }) =>
      api.copy(fileId, name, parentIds),
    onSuccess: () => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      toast.success('Arquivo copiado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao copiar arquivo: ${error.message}`)
    },
  })
}

// Hook para deletar arquivo ou pasta
export function useDeleteGoogleDriveFile() {
  const api = useGoogleDriveApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: string) => api.delete(fileId),
    onSuccess: (_, deletedFileId) => {
      // Invalidar listas de arquivos
      queryClient.invalidateQueries({
        queryKey: googleDriveQueryKeys.files(),
      })

      // Remover o arquivo do cache
      queryClient.removeQueries({
        queryKey: googleDriveQueryKeys.file(deletedFileId),
      })

      toast.success('Item excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`)
    },
  })
}

// Hook para baixar arquivo
export function useDownloadGoogleDriveFile() {
  const api = useGoogleDriveApi()

  return useMutation({
    mutationFn: (fileId: string) => api.downloadFile(fileId),
    onSuccess: () => {
      toast.success('Arquivo baixado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao baixar arquivo: ${error.message}`)
    },
  })
}
