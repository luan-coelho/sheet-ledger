import { Readable } from 'stream'

import { google } from 'googleapis'

// Interface para arquivo retornado pela API do Google Drive
interface GoogleDriveApiFile {
  id?: string | null
  name?: string | null
  mimeType?: string | null
  size?: string | null
  modifiedTime?: string | null
  parents?: string[] | null
  webViewLink?: string | null
  webContentLink?: string | null
  thumbnailLink?: string | null
  iconLink?: string | null
}

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

// Nome da pasta raiz da aplicação
export const APP_ROOT_FOLDER_NAME = process.env.NODE_ENV === 'development' ? 'planilhas-app-dev' : 'planilhas-app'

// Configuração do cliente Google Drive
export class GoogleDriveService {
  private drive: ReturnType<typeof google.drive>
  private appRootFolderId: string | null = null

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.drive = google.drive({ version: 'v3', auth })
  }

  // Encontrar ou criar a pasta raiz da aplicação
  async ensureAppRootFolder(): Promise<string> {
    if (this.appRootFolderId) {
      return this.appRootFolderId
    }

    try {
      // Procurar pela pasta "APP_ROOT_FOLDER_NAME" na raiz do Drive
      const response = await this.drive.files.list({
        q: `name='${APP_ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
        fields: 'files(id,name)',
        pageSize: 1,
      })

      if (response.data.files && response.data.files.length > 0) {
        // Pasta encontrada
        this.appRootFolderId = response.data.files[0].id!
      } else {
        // Criar a pasta
        const createResponse = await this.drive.files.create({
          requestBody: {
            name: APP_ROOT_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['root'],
          },
          fields: 'id,name',
        })

        this.appRootFolderId = createResponse.data.id!
      }

      return this.appRootFolderId
    } catch (error) {
      console.error('Erro ao garantir pasta raiz da aplicação:', error)
      throw new Error('Falha ao acessar pasta da aplicação no Google Drive')
    }
  }

  // Validar se um arquivo/pasta está dentro da pasta da aplicação
  async validateFileAccess(fileId: string): Promise<boolean> {
    try {
      const appRootId = await this.ensureAppRootFolder()

      // Obter informações do arquivo
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,parents',
      })

      const file = response.data
      if (!file.parents) {
        return false
      }

      // Verificar se o arquivo está na pasta da aplicação ou em suas subpastas
      return await this.isFileInAppFolder(fileId, appRootId)
    } catch (error) {
      console.error('Erro ao validar acesso ao arquivo:', error)
      return false
    }
  }

  // Verificar recursivamente se um arquivo está dentro da pasta da aplicação
  private async isFileInAppFolder(fileId: string, appRootId: string): Promise<boolean> {
    try {
      if (fileId === appRootId) {
        return true
      }

      const response = await this.drive.files.get({
        fileId,
        fields: 'id,parents',
      })

      const file = response.data
      if (!file.parents || file.parents.length === 0) {
        return false
      }

      // Verificar cada parent
      for (const parentId of file.parents) {
        if (parentId === appRootId) {
          return true
        }

        // Verificar recursivamente se o parent está dentro da pasta da aplicação
        if (await this.isFileInAppFolder(parentId, appRootId)) {
          return true
        }
      }

      return false
    } catch {
      return false
    }
  }

  // Listar arquivos e pastas (apenas dentro da pasta da aplicação)
  async listFiles(folderId?: string, pageSize: number = 100): Promise<DriveFile[]> {
    try {
      const appRootId = await this.ensureAppRootFolder()

      // Se não especificou folderId, usar a pasta raiz da aplicação
      const targetFolderId = folderId || appRootId

      // Validar acesso se foi especificado um folderId
      if (folderId && !(await this.validateFileAccess(folderId))) {
        throw new Error('Acesso negado: pasta fora do escopo da aplicação')
      }

      const query = `'${targetFolderId}' in parents and trashed=false`

      const response = await this.drive.files.list({
        q: query,
        pageSize,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)',
        orderBy: 'folder,name',
      })

      return (response.data.files || []).map((file: GoogleDriveApiFile) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        iconLink: file.iconLink || undefined,
      }))
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      throw new Error('Falha ao listar arquivos do Google Drive')
    }
  }

  // Buscar arquivos por nome (apenas dentro da pasta da aplicação)
  async searchFiles(query: string, pageSize: number = 50): Promise<DriveFile[]> {
    try {
      const appRootId = await this.ensureAppRootFolder()

      // Buscar apenas dentro da pasta da aplicação
      const searchQuery = `name contains '${query}' and trashed=false and '${appRootId}' in parents`

      const response = await this.drive.files.list({
        q: searchQuery,
        pageSize,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)',
        orderBy: 'folder,name',
      })

      // Filtrar apenas arquivos que estão realmente dentro da pasta da aplicação
      const files = (response.data.files || []).map((file: GoogleDriveApiFile) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        iconLink: file.iconLink || undefined,
      }))

      // Validação adicional para garantir que estão na pasta da aplicação
      const validFiles: DriveFile[] = []
      for (const file of files) {
        if (await this.validateFileAccess(file.id)) {
          validFiles.push(file)
        }
      }

      return validFiles
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      throw new Error('Falha ao buscar arquivos no Google Drive')
    }
  }

  // Obter detalhes de um arquivo (com validação de acesso)
  async getFile(fileId: string): Promise<DriveFile> {
    try {
      // Validar acesso ao arquivo
      if (!(await this.validateFileAccess(fileId))) {
        throw new Error('Acesso negado: arquivo fora do escopo da aplicação')
      }

      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        iconLink: file.iconLink || undefined,
      }
    } catch (error) {
      console.error('Erro ao obter arquivo:', error)
      throw new Error('Falha ao obter arquivo do Google Drive')
    }
  }

  // Criar arquivo (apenas dentro da pasta da aplicação)
  async createFile(options: CreateFileOptions): Promise<DriveFile> {
    try {
      const appRootId = await this.ensureAppRootFolder()

      // Se não especificou parents, usar a pasta raiz da aplicação
      const parents = options.parents || [appRootId]

      // Validar que todos os parents estão dentro da pasta da aplicação
      for (const parentId of parents) {
        if (!(await this.validateFileAccess(parentId))) {
          throw new Error('Acesso negado: pasta pai fora do escopo da aplicação')
        }
      }

      const fileMetadata: Record<string, unknown> = {
        name: options.name,
        parents,
      }

      let media
      if (options.content) {
        media = {
          mimeType: options.mimeType || 'application/octet-stream',
          body: options.content,
        }
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
      }
    } catch (error) {
      console.error('Erro ao criar arquivo:', error)
      throw new Error('Falha ao criar arquivo no Google Drive')
    }
  }

  // Criar pasta (apenas dentro da pasta da aplicação)
  async createFolder(options: CreateFolderOptions): Promise<DriveFolder> {
    try {
      const appRootId = await this.ensureAppRootFolder()

      // Se não especificou parents, usar a pasta raiz da aplicação
      const parents = options.parents || [appRootId]

      // Validar que todos os parents estão dentro da pasta da aplicação
      for (const parentId of parents) {
        if (!(await this.validateFileAccess(parentId))) {
          throw new Error('Acesso negado: pasta pai fora do escopo da aplicação')
        }
      }

      const fileMetadata = {
        name: options.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents,
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id,name,parents,modifiedTime',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        parents: file.parents || undefined,
        modifiedTime: file.modifiedTime || '',
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      throw new Error('Falha ao criar pasta no Google Drive')
    }
  }

  // Atualizar arquivo (com validação de acesso)
  async updateFile(fileId: string, options: UpdateFileOptions): Promise<DriveFile> {
    // Validar acesso ao arquivo
    if (!(await this.validateFileAccess(fileId))) {
      throw new Error('Acesso negado: arquivo fora do escopo da aplicação')
    }
    try {
      const fileMetadata: Record<string, unknown> = {}
      if (options.name) {
        fileMetadata.name = options.name
      }

      let media
      if (options.content) {
        media = {
          mimeType: options.mimeType || 'application/octet-stream',
          body: options.content,
        }
      }

      const response = await this.drive.files.update({
        fileId,
        requestBody: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
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
        fields: 'id,name,mimeType,size,modifiedTime,parents',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
      }
    } catch (error) {
      console.error('Erro ao renomear arquivo:', error)
      throw new Error('Falha ao renomear arquivo no Google Drive')
    }
  }

  // Mover arquivo ou pasta
  async move(fileId: string, newParentId: string, oldParentId?: string): Promise<DriveFile> {
    try {
      const params: Record<string, unknown> = {
        fileId,
        addParents: newParentId,
        fields: 'id,name,mimeType,size,modifiedTime,parents',
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
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
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
          parents: parentIds,
        },
        fields: 'id,name,mimeType,size,modifiedTime,parents',
      })

      const file = response.data
      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
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
        fileId,
      })
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      throw new Error('Falha ao deletar arquivo do Google Drive')
    }
  }

  // Baixar arquivo
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' },
      )

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
        fields: 'storageQuota',
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
          emailAddress: email,
        },
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
        permissionId,
      })
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error)
      throw new Error('Falha ao remover compartilhamento')
    }
  }

  // Listar permissões de um arquivo
  async getFilePermissions(fileId: string): Promise<unknown[]> {
    try {
      const response = await this.drive.permissions.list({
        fileId,
        fields: 'permissions(id,type,role,emailAddress,displayName)',
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
