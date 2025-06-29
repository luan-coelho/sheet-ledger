import { NextRequest, NextResponse } from 'next/server'

import { ExcelService } from '@/lib/excel-service'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate if all required fields are present
    const requiredFields = [
      'professional',
      'licenseNumber',
      'authorizedSession',
      'patientName',
      'responsible',
      'healthPlan',
      'weekDaySessions',
      'startTime',
      'endTime',
    ]

    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` }, { status: 400 })
    }

    // Generate the attendance spreadsheet
    const spreadsheetBuffer = await ExcelService.generateAttendanceSheet(data)

    // Create response with Excel file
    const response = new NextResponse(spreadsheetBuffer)

    // Set headers for download
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response.headers.set('Content-Disposition', 'attachment; filename="attendance-sheet.xlsx"')

    return response
  } catch (error) {
    console.error('Erro ao gerar planilha:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar planilha. Por favor, verifique os dados e tente novamente.' },
      { status: 500 },
    )
  }
}
