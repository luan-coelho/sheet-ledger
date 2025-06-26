import { auth as getAuth } from '@/lib/auth'
import { ExcelService } from '@/lib/excel-service'
import { googleDriveConfigService } from '@/services/google-drive-config-service'
import { APP_ROOT_FOLDER_NAME } from '@/services/google-drive-service'
import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'

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
      startDate: new Date(Math.max(current.getTime(), startDate.getTime())),
      endDate: new Date(
        Math.min(new Date(current.getFullYear(), current.getMonth() + 1, 0).getTime(), endDate.getTime()),
      ),
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
    const {
      professional,
      licenseNumber,
      authorizedSession,
      patientName,
      responsible,
      healthPlan,
      weekDaySessions,
      dataInicio,
      dataFim,
      horarioInicio,
      horarioFim,
    } = body

    if (!dataInicio || !dataFim) {
      return NextResponse.json({ error: 'Data de início e fim são obrigatórias' }, { status: 400 })
    }

    const startDate = new Date(dataInicio)
    const endDate = new Date(dataFim)

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'Data de início deve ser anterior à data de fim' }, { status: 400 })
    }

    // Inicializar cliente do Google Drive
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    const drive = google.drive({ version: 'v3', auth })

    let appRootId: string

    // Buscar pasta raiz
    const rootSearch = await drive.files.list({
      q: `name='${APP_ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
      fields: 'files(id,name)',
      pageSize: 1,
    })

    if (rootSearch.data.files && rootSearch.data.files.length > 0) {
      appRootId = rootSearch.data.files[0].id!
    } else {
      // Criar pasta raiz
      const rootFolder = await drive.files.create({
        requestBody: {
          name: APP_ROOT_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['root'],
        },
        fields: 'id,name',
      })
      appRootId = rootFolder.data.id!
    }

    // Buscar ou criar pasta do paciente
    const patientFolderName = patientName.trim()
    let patientFolderId: string

    // Buscar pasta existente do paciente
    const patientSearch = await drive.files.list({
      q: `name='${patientFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${appRootId}' in parents`,
      fields: 'files(id,name)',
      pageSize: 1,
    })

    if (patientSearch.data.files && patientSearch.data.files.length > 0) {
      patientFolderId = patientSearch.data.files[0].id!
    } else {
      // Criar nova pasta para o paciente
      const patientFolder = await drive.files.create({
        requestBody: {
          name: patientFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [appRootId],
        },
        fields: 'id,name',
      })
      patientFolderId = patientFolder.data.id!
    }

    // Obter meses do período
    const months = getMonthsBetweenDates(startDate, endDate)
    const createdFiles = []

    // Gerar planilha para cada mês
    for (const monthInfo of months) {
      // Gerar planilha para o mês
      const spreadsheetBuffer = await ExcelService.generateAttendanceSheet({
        professional,
        licenseNumber,
        authorizedSession,
        patientName,
        responsible,
        healthPlan,
        weekDaySessions,
        dataInicio: monthInfo.startDate.toISOString().split('T')[0],
        dataFim: monthInfo.endDate.toISOString().split('T')[0],
        horarioInicio,
        horarioFim,
      })

      // Nome do arquivo: "Janeiro 2024.xlsx"
      const fileName = `${monthInfo.monthName.charAt(0).toUpperCase() + monthInfo.monthName.slice(1)} ${monthInfo.year}.xlsx`

      // Verificar se já existe arquivo com esse nome
      const fileSearch = await drive.files.list({
        q: `name='${fileName}' and trashed=false and '${patientFolderId}' in parents`,
        fields: 'files(id,name)',
        pageSize: 1,
      })

      // Converter buffer para stream
      const bufferStream = new Readable()
      bufferStream.push(Buffer.from(spreadsheetBuffer))
      bufferStream.push(null)

      let fileId: string
      if (fileSearch.data.files && fileSearch.data.files.length > 0) {
        // Atualizar arquivo existente
        const existingFileId = fileSearch.data.files[0].id!
        const updatedFile = await drive.files.update({
          fileId: existingFileId,
          media: {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: bufferStream,
          },
        })
        fileId = updatedFile.data.id!
      } else {
        // Criar stream novamente para criar arquivo (streams são consumidos)
        const createStream = new Readable()
        createStream.push(Buffer.from(spreadsheetBuffer))
        createStream.push(null)

        // Criar novo arquivo
        const newFile = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [patientFolderId],
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
          media: {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: createStream,
          },
          fields: 'id,name',
        })
        fileId = newFile.data.id!
      }

      createdFiles.push({
        id: fileId,
        name: fileName,
        month: monthInfo.monthName,
        year: monthInfo.year,
      })
    }

    return NextResponse.json({
      success: true,
      message: `${createdFiles.length} planilha(s) gerada(s) com sucesso no Google Drive`,
      patientFolder: patientFolderName,
      files: createdFiles,
    })
  } catch (error) {
    console.error('Erro ao gerar planilhas no Google Drive:', error)

    // Tratar erros específicos do Google Drive
    if (error instanceof Error) {
      if (error.message.includes('Invalid Credentials') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Token do Google Drive expirado ou inválido. Reconfigure nas configurações.' },
          { status: 401 },
        )
      }

      if (error.message.includes('quotaExceeded')) {
        return NextResponse.json(
          { error: 'Cota do Google Drive excedida. Tente novamente mais tarde.' },
          { status: 429 },
        )
      }

      if (error.message.includes('notFound')) {
        return NextResponse.json({ error: 'Pasta ou arquivo não encontrado no Google Drive.' }, { status: 404 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
