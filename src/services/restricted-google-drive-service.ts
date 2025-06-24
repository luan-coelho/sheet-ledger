import { google } from 'googleapis'
import { Readable } from 'stream'

// Tipos para arquivos e pastas do Google Drive
export interface RestrictedDriveFile {
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

export interface RestrictedDriveFolder {
  id: string
  name: string
  parents?: string[]
  modifiedTime: string
}

export interface CreateRestrictedFileOptions {
  name: string
  parentFolderId?: string // Será sempre dentro da pasta da aplicação
  content?: Buffer | Readable | string
  mimeType?: string
}

export interface CreateRestrictedFolderOptions {
  name: string
  parentFolderId?: string // Será sempre dentro da pasta da aplicação
}

// Nome da pasta raiz da aplicação
export const APP_ROOT_FOLDER_NAME = 'planilhas-app'

// Serviço restrito do Google Drive
export class RestrictedGoogleDriveService {
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
      console.log(`🔍 Procurando pasta "${APP_ROOT_FOLDER_NAME}"...`)
      
      // Procurar pela pasta "planilhas-app" na raiz do Drive
      const response = await this.drive.files.list({
        q: `name='${APP_ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
        fields: 'files(id,name)',
        pageSize: 1
      })

      if (response.data.files && response.data.files.length > 0) {
        // Pasta encontrada
        this.appRootFolderId = response.data.files[0].id!
        console.log(`✅ Pasta "${APP_ROOT_FOLDER_NAME}" encontrada: ${this.appRootFolderId}`)
      } else {
        // Criar a pasta
        console.log(`📁 Criando pasta "${APP_ROOT_FOLDER_NAME}"...`)
        const createResponse = await this.drive.files.create({
          requestBody: {
            name: APP_ROOT_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
            parents: ['root']
          },
          fields: 'id,name'
        })

        this.appRootFolderId = createResponse.data.id!
        console.log(`✅ Pasta "${APP_ROOT_FOLDER_NAME}" criada: ${this.appRootFolderId}`)
      }

      return this.appRootFolderId
    } catch (error) {
      console.error('Erro ao garantir pasta raiz da aplicação:', error)
      throw new Error('Falha ao acessar pasta da aplicação no Google Drive')
    }
  }

  // Validar se uma pasta está dentro da pasta da aplicação
  async validateFolderAccess(folderId: string): Promise<boolean> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      if (folderId === appRootId) {
        return true
      }

      // Verificar se a pasta é filha da pasta raiz da aplicação
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'id,parents'
      })

      const folder = response.data
      if (!folder.parents) {
        return false
      }

      // Verificar se algum parent é a pasta raiz da aplicação
      return folder.parents.includes(appRootId)
    } catch (error) {
      console.error('Erro ao validar acesso à pasta:', error)
      return false
    }
  }

  // Listar arquivos e pastas dentro da pasta da aplicação
  async listFiles(folderId?: string): Promise<RestrictedDriveFile[]> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      // Se não especificou folderId, usar a pasta raiz da aplicação
      const targetFolderId = folderId || appRootId
      
      // Validar acesso se foi especificado um folderId
      if (folderId && !(await this.validateFolderAccess(folderId))) {
        throw new Error('Acesso negado: pasta fora do escopo da aplicação')
      }

      console.log(`📂 Listando arquivos na pasta: ${targetFolderId}`)

      const response = await this.drive.files.list({
        q: `'${targetFolderId}' in parents and trashed=false`,
        pageSize: 100,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)',
        orderBy: 'folder,name'
      })

      const files = (response.data.files || []).map(file => ({
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

      console.log(`✅ Encontrados ${files.length} arquivos/pastas`)
      return files
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      throw new Error('Falha ao listar arquivos do Google Drive')
    }
  }

  // Buscar arquivos por nome dentro da pasta da aplicação
  async searchFiles(searchTerm: string): Promise<RestrictedDriveFile[]> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      console.log(`🔍 Buscando arquivos com termo: "${searchTerm}"`)

      // Buscar recursivamente dentro da pasta da aplicação
      const response = await this.drive.files.list({
        q: `name contains '${searchTerm}' and trashed=false`,
        pageSize: 50,
        fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink)'
      })

      const allFiles = (response.data.files || []).map(file => ({
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

      // Filtrar apenas arquivos que estão dentro da pasta da aplicação
      const validFiles: RestrictedDriveFile[] = []
      for (const file of allFiles) {
        if (file.parents && file.parents.some(parentId => parentId === appRootId)) {
          validFiles.push(file)
        }
      }

      console.log(`✅ Encontrados ${validFiles.length} arquivos válidos`)
      return validFiles
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
      throw new Error('Falha ao buscar arquivos no Google Drive')
    }
  }

  // Criar arquivo dentro da pasta da aplicação
  async createFile(options: CreateRestrictedFileOptions): Promise<RestrictedDriveFile> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      // Determinar a pasta pai
      const parentFolderId = options.parentFolderId || appRootId
      
      // Validar acesso à pasta pai se especificada
      if (options.parentFolderId && !(await this.validateFolderAccess(options.parentFolderId))) {
        throw new Error('Acesso negado: pasta pai fora do escopo da aplicação')
      }

      console.log(`📄 Criando arquivo "${options.name}" na pasta: ${parentFolderId}`)

      const fileMetadata = {
        name: options.name,
        parents: [parentFolderId]
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
      const createdFile = {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        modifiedTime: file.modifiedTime || '',
        parents: file.parents || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
      }

      console.log(`✅ Arquivo criado: ${createdFile.id}`)
      return createdFile
    } catch (error) {
      console.error('Erro ao criar arquivo:', error)
      throw new Error('Falha ao criar arquivo no Google Drive')
    }
  }

  // Criar pasta dentro da pasta da aplicação
  async createFolder(options: CreateRestrictedFolderOptions): Promise<RestrictedDriveFolder> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      // Determinar a pasta pai
      const parentFolderId = options.parentFolderId || appRootId
      
      // Validar acesso à pasta pai se especificada
      if (options.parentFolderId && !(await this.validateFolderAccess(options.parentFolderId))) {
        throw new Error('Acesso negado: pasta pai fora do escopo da aplicação')
      }

      console.log(`📁 Criando pasta "${options.name}" na pasta: ${parentFolderId}`)

      const response = await this.drive.files.create({
        requestBody: {
          name: options.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        },
        fields: 'id,name,parents,modifiedTime'
      })

      const folder = response.data
      const createdFolder = {
        id: folder.id || '',
        name: folder.name || '',
        parents: folder.parents || undefined,
        modifiedTime: folder.modifiedTime || '',
      }

      console.log(`✅ Pasta criada: ${createdFolder.id}`)
      return createdFolder
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      throw new Error('Falha ao criar pasta no Google Drive')
    }
  }

  // Obter informações da pasta raiz da aplicação
  async getAppRootFolderInfo(): Promise<RestrictedDriveFolder> {
    try {
      const appRootId = await this.ensureAppRootFolder()
      
      const response = await this.drive.files.get({
        fileId: appRootId,
        fields: 'id,name,parents,modifiedTime'
      })

      const folder = response.data
      return {
        id: folder.id || '',
        name: folder.name || '',
        parents: folder.parents || undefined,
        modifiedTime: folder.modifiedTime || '',
      }
    } catch (error) {
      console.error('Erro ao obter informações da pasta raiz:', error)
      throw new Error('Falha ao obter informações da pasta da aplicação')
    }
  }

  // Obter detalhes de um arquivo (apenas se estiver na pasta da aplicação)
  async getFile(fileId: string): Promise<RestrictedDriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink,iconLink'
      })

      const file = response.data
      const fileData = {
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

      // Validar se o arquivo está na pasta da aplicação
      const appRootId = await this.ensureAppRootFolder()
      if (!fileData.parents || !fileData.parents.includes(appRootId)) {
        throw new Error('Acesso negado: arquivo fora do escopo da aplicação')
      }

      return fileData
    } catch (error) {
      console.error('Erro ao obter arquivo:', error)
      throw new Error('Falha ao obter arquivo do Google Drive')
    }
  }

  // Download de arquivo (apenas se estiver na pasta da aplicação)
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      // Primeiro validar se o arquivo está na pasta da aplicação
      await this.getFile(fileId)

      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' })

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        response.data.on('data', (chunk: Buffer) => chunks.push(chunk))
        response.data.on('end', () => resolve(Buffer.concat(chunks)))
        response.data.on('error', reject)
      })
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      throw new Error('Falha ao baixar arquivo do Google Drive')
    }
  }
}

// Factory function para criar o serviço
export function createRestrictedGoogleDriveService(accessToken: string): RestrictedGoogleDriveService {
  return new RestrictedGoogleDriveService(accessToken)
} 