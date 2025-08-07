import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { handleGoogleDriveError } from '@/lib/google-drive-error-handler'

import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { createGoogleDriveService } from '@/services/google-drive-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obter detalhes de um arquivo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    const file = await service.getFile(id)

    return NextResponse.json({
      success: true,
      data: file,
      message: 'Arquivo obtido com sucesso',
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao obter arquivo')
  }
}

// PUT - Atualizar arquivo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, ...options } = body

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)

    let result
    switch (action) {
      case 'rename':
        result = await service.rename(id, options.newName)
        break
      case 'move':
        result = await service.move(id, options.newParentId, options.oldParentId)
        break
      case 'copy':
        result = await service.copy(id, options.name, options.parentIds)
        break
      case 'update':
        result = await service.updateFile(id, options)
        break
      default:
        return NextResponse.json({ success: false, message: 'Ação não reconhecida' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Arquivo atualizado com sucesso',
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao atualizar arquivo')
  }
}

// DELETE - Deletar arquivo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    await service.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao deletar arquivo')
  }
}
