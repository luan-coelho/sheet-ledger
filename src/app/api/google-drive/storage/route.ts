import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { handleGoogleDriveError } from '@/lib/google-drive-error-handler'

import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { createGoogleDriveService } from '@/services/google-drive-service'

// GET - Obter informações de armazenamento
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const accessToken = await googleDriveConfigService.getValidAccessToken()
    const service = createGoogleDriveService(accessToken)
    const storageInfo = await service.getStorageInfo()

    return NextResponse.json({
      success: true,
      data: storageInfo,
      message: 'Informações de armazenamento obtidas com sucesso',
    })
  } catch (error) {
    return handleGoogleDriveError(error, 'Erro ao obter informações de armazenamento')
  }
}
