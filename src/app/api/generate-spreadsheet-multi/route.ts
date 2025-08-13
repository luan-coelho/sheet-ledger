import JSZip from 'jszip'
import { NextRequest, NextResponse } from 'next/server'

import { ExcelService } from '@/lib/excel-service'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar se todos os campos obrigatórios estão presentes
    const requiredFields = [
      'professional',
      'licenseNumber',
      'patientName',
      'responsible',
      'healthPlan',
      'weekDaySessions',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
    ]

    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 })
    }

    const startDate = new Date(data.startDate + 'T00:00:00')
    const endDate = new Date(data.endDate + 'T00:00:00')

    // Gerar lista de meses no período
    const months = getMonthsInPeriod(startDate, endDate)

    if (months.length === 1) {
      // Se for apenas um mês, usar a API normal
      const spreadsheetBuffer = await ExcelService.generateAttendanceSheet(data)

      const response = new NextResponse(spreadsheetBuffer)
      response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      response.headers.set('Content-Disposition', 'attachment; filename="registro-atendimento.xlsx"')

      return response
    }

    // Se for mais de um mês, gerar ZIP
    const zip = new JSZip()

    for (const month of months) {
      const monthStartDate = new Date(month.year, month.month, 1)
      const monthEndDate = new Date(month.year, month.month + 1, 0)

      // Cada planilha deve conter o mês completo
      const monthData = {
        ...data,
        startDate: formatDateToString(monthStartDate),
        endDate: formatDateToString(monthEndDate),
      }

      const spreadsheetBuffer = await ExcelService.generateAttendanceSheet(monthData)

      // Nome do arquivo: MM-YYYY.xlsx
      const fileName = `${String(month.month + 1).padStart(2, '0')}-${month.year}.xlsx`
      zip.file(fileName, spreadsheetBuffer)
    }

    // Gerar o ZIP
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })

    const response = new NextResponse(zipBuffer)
    response.headers.set('Content-Type', 'application/zip')
    response.headers.set('Content-Disposition', 'attachment; filename="registros-atendimentos.zip"')

    return response
  } catch (error) {
    console.error('Error generating spreadsheets:', error)
    return NextResponse.json(
      { error: 'Error generating spreadsheets. Please verify your data and try again.' },
      { status: 500 },
    )
  }
}

// Helper para obter todos os meses em um período
function getMonthsInPeriod(startDate: Date, endDate: Date): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = []

  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth(),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

// Helper para formatar data para string YYYY-MM-DD
function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
