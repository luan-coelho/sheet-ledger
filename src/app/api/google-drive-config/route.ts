import { NextRequest, NextResponse } from 'next/server'
import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { auth } from '@/lib/auth'

// GET - Obter status da configuração
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const status = await googleDriveConfigService.getConfigStatus()

    return NextResponse.json({
      success: true,
      data: status,
      message: 'Status obtido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao obter status do Google Drive:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// POST - Configurar Google Drive com código de autorização
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ success: false, message: 'Código de autorização é obrigatório' }, { status: 400 })
    }

    // Trocar código por tokens
    const tokens = await googleDriveConfigService.exchangeCodeForTokens(code)

    // Salvar configuração no banco
    const config = await googleDriveConfigService.saveConfig({
      accountEmail: tokens.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    })

    return NextResponse.json({
      success: true,
      data: {
        accountEmail: config.accountEmail,
        configuredAt: config.createdAt,
      },
      message: 'Google Drive configurado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao configurar Google Drive:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao configurar Google Drive',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// DELETE - Remover configuração do Google Drive
export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 })
    }

    await googleDriveConfigService.removeConfig()

    return NextResponse.json({
      success: true,
      message: 'Configuração do Google Drive removida com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover configuração do Google Drive:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao remover configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
