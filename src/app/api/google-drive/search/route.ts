import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGoogleDriveService } from '@/services/google-drive-service'
import { googleDriveConfigService } from '@/services/google-drive-config-service'

// GET - Buscar arquivos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Parâmetro de busca (q) é obrigatório' },
        { status: 400 }
      )
    }

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    const files = await service.searchFiles(query, pageSize)

    return NextResponse.json({
      success: true,
      data: files,
      message: 'Busca realizada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API Google Drive - Search:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar arquivos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 