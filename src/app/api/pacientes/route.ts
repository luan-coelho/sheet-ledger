import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { patientsTable, insertPatientSchema } from '@/app/db/schemas/patient-schema'
import { desc } from 'drizzle-orm'

// GET /api/pacientes - Listar todos os pacientes
export async function GET() {
  try {
    const allPatients = await db.select().from(patientsTable).orderBy(desc(patientsTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allPatients,
      message: 'Pacientes listados com sucesso',
    })
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os pacientes',
      },
      { status: 500 },
    )
  }
}

// POST /api/pacientes - Criar novo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados usando Zod schema
    const validatedData = insertPatientSchema.parse(body)

    // Inserir no banco de dados
    const [newPatient] = await db
      .insert(patientsTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newPatient,
        message: 'Paciente criado com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao criar paciente:', error)

    // Erro de validação Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Verifique os dados fornecidos',
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o paciente',
      },
      { status: 500 },
    )
  }
}
