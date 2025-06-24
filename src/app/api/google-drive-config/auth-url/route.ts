import { NextResponse } from 'next/server'
import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { auth } from '@/lib/auth'

// GET - Obter URL de autorização do Google Drive
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const authUrl = googleDriveConfigService.generateAuthUrl()

    return NextResponse.json({
      success: true,
      data: { authUrl },
      message: 'URL de autorização gerada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao gerar URL de autorização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
