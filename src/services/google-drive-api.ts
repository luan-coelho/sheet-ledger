// Tipos para os arquivos e pastas do Google Drive
export interface DriveFile {
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

export interface DriveFolder {
  id: string
  name: string
  parents?: string[]
  modifiedTime: string
}

export interface CreateFileOptions {
  name: string
  parents?: string[]
  content?: string
  mimeType?: string
}

export interface CreateFolderOptions {
  name: string
  parents?: string[]
}

export interface UpdateFileOptions {
  name?: string
  content?: string
  mimeType?: string
}

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição')
    }

    return data
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

// Serviço para o Google Drive (lado cliente)
export class GoogleDriveApi {
  // Listar arquivos e pastas
  async listFiles(folderId?: string, pageSize: number = 100): Promise<DriveFile[]> {
    const params = new URLSearchParams()
    if (folderId) params.append('folderId', folderId)
    params.append('pageSize', pageSize.toString())

    const response = await apiRequest<DriveFile[]>(`/api/google-drive/files?${params}`)
    return response.data || []
  }

  // Buscar arquivos por nome
  async searchFiles(query: string, pageSize: number = 50): Promise<DriveFile[]> {
    const params = new URLSearchParams()
    params.append('q', query)
    params.append('pageSize', pageSize.toString())

    const response = await apiRequest<DriveFile[]>(`/api/google-drive/search?${params}`)
    return response.data || []
  }

  // Obter detalhes de um arquivo
  async getFile(fileId: string): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>(`/api/google-drive/files/${fileId}`)
    if (!response.data) {
      throw new Error('Arquivo não encontrado')
    }
    return response.data
  }

  // Criar arquivo
  async createFile(options: CreateFileOptions): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>('/api/google-drive/files', {
      method: 'POST',
      body: JSON.stringify({
        type: 'file',
        ...options,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao criar arquivo')
    }

    return response.data
  }

  // Criar pasta
  async createFolder(options: CreateFolderOptions): Promise<DriveFolder> {
    const response = await apiRequest<DriveFolder>('/api/google-drive/files', {
      method: 'POST',
      body: JSON.stringify({
        type: 'folder',
        ...options,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao criar pasta')
    }

    return response.data
  }

  // Atualizar arquivo
  async updateFile(fileId: string, options: UpdateFileOptions): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>(`/api/google-drive/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({
        action: 'update',
        ...options,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao atualizar arquivo')
    }

    return response.data
  }

  // Renomear arquivo ou pasta
  async rename(fileId: string, newName: string): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>(`/api/google-drive/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({
        action: 'rename',
        newName,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao renomear arquivo')
    }

    return response.data
  }

  // Mover arquivo ou pasta
  async move(fileId: string, newParentId: string, oldParentId?: string): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>(`/api/google-drive/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({
        action: 'move',
        newParentId,
        oldParentId,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao mover arquivo')
    }

    return response.data
  }

  // Copiar arquivo
  async copy(fileId: string, name: string, parentIds?: string[]): Promise<DriveFile> {
    const response = await apiRequest<DriveFile>(`/api/google-drive/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({
        action: 'copy',
        name,
        parentIds,
      }),
    })

    if (!response.data) {
      throw new Error('Erro ao copiar arquivo')
    }

    return response.data
  }

  // Deletar arquivo ou pasta
  async delete(fileId: string): Promise<void> {
    await apiRequest(`/api/google-drive/files/${fileId}`, {
      method: 'DELETE',
    })
  }

  // Baixar arquivo
  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`/api/google-drive/files/${fileId}/download`)
    
    if (!response.ok) {
      throw new Error('Erro ao baixar arquivo')
    }

    return response.blob()
  }

  // Obter informações de uso do Drive
  async getStorageInfo(): Promise<{ total: string; used: string; free: string }> {
    const response = await apiRequest<{ total: string; used: string; free: string }>('/api/google-drive/storage')
    return response.data || { total: '0', used: '0', free: '0' }
  }
}

// Função utilitária para obter uma instância do serviço
export function createGoogleDriveApi(): GoogleDriveApi {
  return new GoogleDriveApi()
}

// Query keys para React Query
export const googleDriveQueryKeys = {
  all: ['google-drive'] as const,
  files: () => [...googleDriveQueryKeys.all, 'files'] as const,
  filesList: (folderId?: string) => [...googleDriveQueryKeys.files(), 'list', { folderId }] as const,
  file: (fileId: string) => [...googleDriveQueryKeys.files(), 'detail', fileId] as const,
  search: (query: string) => [...googleDriveQueryKeys.files(), 'search', query] as const,
  storage: () => [...googleDriveQueryKeys.all, 'storage'] as const,
} 