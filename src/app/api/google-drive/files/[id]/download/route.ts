import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { handleGoogleDriveError } from '@/lib/google-drive-error-handler'

import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { createGoogleDriveService } from '@/services/google-drive-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Baixar arquivo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)

    // Primeiro obter informações do arquivo
    const fileInfo = await service.getFile(id)

    // Baixar o conteúdo do arquivo
    const fileBuffer = await service.downloadFile(id)

    // Retornar o arquivo como resposta
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileInfo.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileInfo.name}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao baixar arquivo')
  }
}
