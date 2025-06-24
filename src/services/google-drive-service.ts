import { google } from 'googleapis'
import { Readable } from 'stream'

// Tipos simplificados para os arquivos e pastas do Google Drive
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
  content?: Buffer | Readable | string
  mimeType?: string
}

export interface CreateFolderOptions {
  name: string
  parents?: string[]
}

export interface UpdateFileOptions {
  name?: string
  content?: Buffer | Readable | string
  mimeType?: string
}

// Configuração do cliente Google Drive
export class GoogleDriveService {
  private drive: ReturnType<typeof google.drive>

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.drive = google.drive({ version: 'v3', auth })
  }

  // Listar arquivos e pastas
  async listFiles(folderId?: string, pageSize: number = 100): Promise<DriveFile[]> {
    try {
      const query = folderId 
        ? `'${folderId}' in parents and trashed=false`
        : 'trashed=false'

      const response = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)',
        orderBy: 'folder,name'
      })

      return (response.data.files || []).map((file: any) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        thumbnailLink: file.thumbnailLink,
        iconLink: file.iconLink,
      }))
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      throw new Error('Falha ao listar arquivos do Google Drive')
    }
  }

  // Buscar arquivos por nome
  async searchFiles(query: string, pageSize: number = 50): Promise<DriveFile[]> {
    try {
      const searchQuery = `name contains '${query}' and trashed=false`
      
      const response = await this.drive.files.list({
        q: searchQuery,
        pageSize,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)',
        orderBy: 'folder,name'
      })

      return (response.data.files || []).map((file: any) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        thumbnailLink: file.thumbnailLink,
        iconLink: file.iconLink,
      }))
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      throw new Error('Falha ao buscar arquivos no Google Drive')
    }
  }

  // Obter detalhes de um arquivo
  async getFile(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        thumbnailLink: file.thumbnailLink,
        iconLink: file.iconLink,
      }
    } catch (error) {
      console.error('Erro ao obter arquivo:', error)
      throw new Error('Falha ao obter arquivo do Google Drive')
    }
  }

  // Criar arquivo
  async createFile(options: CreateFileOptions): Promise<DriveFile> {
    try {
      const fileMetadata: Record<string, any> = {
        name: options.name,
        parents: options.parents
      }

      let media
      if (options.content) {
        media = {
          mimeType: options.mimeType || 'application/octet-stream',
          body: options.content
        }
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
      }
    } catch (error) {
      console.error('Erro ao criar arquivo:', error)
      throw new Error('Falha ao criar arquivo no Google Drive')
    }
  }

  // Criar pasta
  async createFolder(options: CreateFolderOptions): Promise<DriveFolder> {
    try {
      const fileMetadata = {
        name: options.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: options.parents
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id,name,parents,modifiedTime'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        parents: file.parents,
        modifiedTime: file.modifiedTime || '',
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      throw new Error('Falha ao criar pasta no Google Drive')
    }
  }

  // Atualizar arquivo
  async updateFile(fileId: string, options: UpdateFileOptions): Promise<DriveFile> {
    try {
      const fileMetadata: Record<string, any> = {}
      if (options.name) {
        fileMetadata.name = options.name
      }

      let media
      if (options.content) {
        media = {
          mimeType: options.mimeType || 'application/octet-stream',
          body: options.content
        }
      }

      const response = await this.drive.files.update({
        fileId,
        requestBody: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
      }
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error)
      throw new Error('Falha ao atualizar arquivo no Google Drive')
    }
  }

  // Renomear arquivo ou pasta
  async rename(fileId: string, newName: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.update({
        fileId,
        requestBody: { name: newName },
        fields: 'id,name,mimeType,size,modifiedTime,parents'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
      }
    } catch (error) {
      console.error('Erro ao renomear arquivo:', error)
      throw new Error('Falha ao renomear arquivo no Google Drive')
    }
  }

  // Mover arquivo ou pasta
  async move(fileId: string, newParentId: string, oldParentId?: string): Promise<DriveFile> {
    try {
      const params: Record<string, any> = {
        fileId,
        addParents: newParentId,
        fields: 'id,name,mimeType,size,modifiedTime,parents'
      }

      if (oldParentId) {
        params.removeParents = oldParentId
      }

      const response = await this.drive.files.update(params)

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
      }
    } catch (error) {
      console.error('Erro ao mover arquivo:', error)
      throw new Error('Falha ao mover arquivo no Google Drive')
    }
  }

  // Copiar arquivo
  async copy(fileId: string, name: string, parentIds?: string[]): Promise<DriveFile> {
    try {
      const response = await this.drive.files.copy({
        fileId,
        requestBody: {
          name,
          parents: parentIds
        },
        fields: 'id,name,mimeType,size,modifiedTime,parents'
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents,
      }
    } catch (error) {
      console.error('Erro ao copiar arquivo:', error)
      throw new Error('Falha ao copiar arquivo no Google Drive')
    }
  }

  // Deletar arquivo ou pasta
  async delete(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId
      })
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      throw new Error('Falha ao deletar arquivo do Google Drive')
    }
  }

  // Baixar arquivo
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' })

      return Buffer.from(response.data as ArrayBuffer)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      throw new Error('Falha ao baixar arquivo do Google Drive')
    }
  }

  // Obter informações de uso do Drive
  async getStorageInfo(): Promise<{ total: string; used: string; free: string }> {
    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota'
      })

      const quota = response.data.storageQuota
      const total = quota?.limit || '0'
      const used = quota?.usage || '0'
      const free = (parseInt(total) - parseInt(used)).toString()

      return { total, used, free }
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error)
      throw new Error('Falha ao obter informações de armazenamento')
    }
  }

  // Criar permissão de compartilhamento
  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email
        }
      })
    } catch (error) {
      console.error('Erro ao compartilhar arquivo:', error)
      throw new Error('Falha ao compartilhar arquivo')
    }
  }

  // Remover permissão de compartilhamento
  async unshareFile(fileId: string, permissionId: string): Promise<void> {
    try {
      await this.drive.permissions.delete({
        fileId,
        permissionId
      })
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error)
      throw new Error('Falha ao remover compartilhamento')
    }
  }

  // Listar permissões de um arquivo
  async getFilePermissions(fileId: string): Promise<any[]> {
    try {
      const response = await this.drive.permissions.list({
        fileId,
        fields: 'permissions(id,type,role,emailAddress,displayName)'
      })

      return response.data.permissions || []
    } catch (error) {
      console.error('Erro ao listar permissões:', error)
      throw new Error('Falha ao listar permissões do arquivo')
    }
  }
}

// Função utilitária para obter uma instância do serviço
export function createGoogleDriveService(accessToken: string): GoogleDriveService {
  return new GoogleDriveService(accessToken)
}

// Query keys para React Query
export const googleDriveQueryKeys = {
  all: ['google-drive'] as const,
  files: () => [...googleDriveQueryKeys.all, 'files'] as const,
  filesList: (folderId?: string) => [...googleDriveQueryKeys.files(), 'list', { folderId }] as const,
  file: (fileId: string) => [...googleDriveQueryKeys.files(), 'detail', fileId] as const,
  search: (query: string) => [...googleDriveQueryKeys.files(), 'search', query] as const,
  storage: () => [...googleDriveQueryKeys.all, 'storage'] as const,
  permissions: (fileId: string) => [...googleDriveQueryKeys.all, 'permissions', fileId] as const,
} 