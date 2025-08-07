import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { handleGoogleDriveError } from '@/lib/google-drive-error-handler'

import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { createGoogleDriveService } from '@/services/google-drive-service'

// GET - Listar arquivos e pastas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    const files = await service.listFiles(folderId || undefined, pageSize)

    return NextResponse.json({
      success: true,
      data: files,
      message: 'Arquivos listados com sucesso',
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao listar arquivos')
  }
}

// POST - Criar arquivo ou pasta
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, parents, content, mimeType } = body

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)

    let result
    if (type === 'folder') {
      result = await service.createFolder({ name, parents })
    } else {
      result = await service.createFile({ name, parents, content, mimeType })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type === 'folder' ? 'Pasta' : 'Arquivo'} criado com sucesso`,
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao criar item')
  }
}
