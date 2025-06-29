import { auth as getAuth } from '@/lib/auth'
import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { APP_ROOT_FOLDER_NAME } from '@/services/google-drive-service'
import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

// Função para obter os meses entre duas datas
function getMonthsBetweenDates(startDate: Date, endDate: Date) {
  const months = []
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      monthName: current.toLocaleDateString('pt-BR', { month: 'long' }),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter token válido do Google Drive
    let accessToken: string
    try {
      accessToken = await googleDriveConfigService.getValidAccessToken()
    } catch (error) {
      console.error('❌ Erro ao obter token do Google Drive:', error)
      return NextResponse.json(
        { error: 'Google Drive não configurado ou token expirado. Configure primeiro nas configurações.' },
        { status: 400 },
      )
    }

    // Parse do body da requisição
    const body = await request.json()
    const { patientName, startDate: startDateStr, endDate: endDateStr } = body

    if (!patientName || !startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Nome do paciente, data de início e fim são obrigatórios' }, { status: 400 })
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    // Inicializar cliente do Google Drive
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    const drive = google.drive({ version: 'v3', auth })

    // Buscar pasta raiz
    const rootSearch = await drive.files.list({
      q: `name='${APP_ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
      fields: 'files(id,name)',
      pageSize: 1,
    })

    if (!rootSearch.data.files || rootSearch.data.files.length === 0) {
      // Se não existe pasta raiz, não há arquivos existentes
      return NextResponse.json({
        hasExistingFiles: false,
        existingFiles: [],
      })
    }

    const appRootId = rootSearch.data.files[0].id!

    // Buscar pasta do paciente
    const patientFolderName = patientName.trim()
    const patientSearch = await drive.files.list({
      q: `name='${patientFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${appRootId}' in parents`,
      fields: 'files(id,name)',
      pageSize: 1,
    })

    if (!patientSearch.data.files || patientSearch.data.files.length === 0) {
      // Se não existe pasta do paciente, não há arquivos existentes
      return NextResponse.json({
        hasExistingFiles: false,
        existingFiles: [],
      })
    }

    const patientFolderId = patientSearch.data.files[0].id!

    // Obter meses do período
    const months = getMonthsBetweenDates(startDate, endDate)
    const existingFiles = []

    // Verificar se existem arquivos para cada mês
    for (const monthInfo of months) {
      const fileName = `${monthInfo.monthName.charAt(0).toUpperCase() + monthInfo.monthName.slice(1)} ${monthInfo.year}.xlsx`

      const fileSearch = await drive.files.list({
        q: `name='${fileName}' and trashed=false and '${patientFolderId}' in parents`,
        fields: 'files(id,name,modifiedTime)',
        pageSize: 1,
      })

      if (fileSearch.data.files && fileSearch.data.files.length > 0) {
        const file = fileSearch.data.files[0]
        existingFiles.push({
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          month: monthInfo.monthName,
          year: monthInfo.year,
        })
      }
    }

    return NextResponse.json({
      hasExistingFiles: existingFiles.length > 0,
      existingFiles,
      totalFiles: months.length,
    })
  } catch (error) {
    console.error('Erro ao verificar arquivos existentes:', error)

    if (error instanceof Error) {
      if (error.message.includes('Invalid Credentials') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Token do Google Drive expirado ou inválido. Reconfigure nas configurações.' },
          { status: 401 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
