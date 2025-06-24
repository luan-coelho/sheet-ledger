import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { createRestrictedGoogleDriveService } from '@/services/restricted-google-drive-service'

// GET - Listar arquivos na pasta da aplicação
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    // Obter token válido do Google Drive
    const accessToken = await googleDriveConfigService.getValidAccessToken()

    // Criar serviço restrito
    const driveService = createRestrictedGoogleDriveService(accessToken)

    // Obter folderId da query string se especificado
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId') || undefined

    // Listar arquivos
    const files = await driveService.listFiles(folderId)

    // Obter informações da pasta raiz da aplicação
    const appRootInfo = await driveService.getAppRootFolderInfo()

    return NextResponse.json({
      success: true,
      data: {
        appRootFolder: appRootInfo,
        files,
        currentFolderId: folderId || appRootInfo.id,
      },
      message: 'Arquivos listados com sucesso',
    })
  } catch (error) {
    console.error('Erro ao listar arquivos restritos:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao listar arquivos',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// POST - Criar arquivo ou pasta na pasta da aplicação
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, parentFolderId, content, mimeType } = body

    if (!type || !name) {
      return NextResponse.json({ success: false, message: 'Tipo e nome são obrigatórios' }, { status: 400 })
    }

    // Obter token válido do Google Drive
    const accessToken = await googleDriveConfigService.getValidAccessToken()

    // Criar serviço restrito
    const driveService = createRestrictedGoogleDriveService(accessToken)

    let result

    if (type === 'folder') {
      // Criar pasta
      result = await driveService.createFolder({
        name,
        parentFolderId,
      })
    } else if (type === 'file') {
      // Criar arquivo
      result = await driveService.createFile({
        name,
        parentFolderId,
        content,
        mimeType,
      })
    } else {
      return NextResponse.json({ success: false, message: 'Tipo deve ser "file" ou "folder"' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type === 'folder' ? 'Pasta' : 'Arquivo'} criado com sucesso`,
    })
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao criar item',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
