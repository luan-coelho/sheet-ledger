import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGoogleDriveService } from '@/services/google-drive-service'
import { googleDriveConfigService } from '@/services/google-drive-config-service'

// GET - Obter informações de armazenamento
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    const storageInfo = await service.getStorageInfo()

    return NextResponse.json({
      success: true,
      data: storageInfo,
      message: 'Informações de armazenamento obtidas com sucesso'
    })

  } catch (error) {
    console.error('Erro na API Google Drive - Storage:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao obter informações de armazenamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 