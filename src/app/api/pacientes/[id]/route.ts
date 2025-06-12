import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patients, insertPatientSchema } from '@/lib/schemas/patient-schema'
import { eq } from 'drizzle-orm'

// GET /api/pacientes/[id] - Buscar paciente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1)

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paciente não encontrado',
          message: 'O paciente solicitado não existe'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: patient,
      message: 'Paciente encontrado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o paciente'
      },
      { status: 500 }
    )
  }
}

// PUT /api/pacientes/[id] - Atualizar paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertPatientSchema.parse(body)
    
    // Verificar se o paciente existe
    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1)

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paciente não encontrado',
          message: 'O paciente que você está tentando atualizar não existe'
        },
        { status: 404 }
      )
    }

    // Atualizar no banco de dados
    const [updatedPatient] = await db
      .update(patients)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedPatient,
      message: 'Paciente atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    
    // Erro de validação Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Verifique os dados fornecidos',
          details: error.message
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o paciente'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/pacientes/[id] - Excluir paciente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o paciente existe
    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1)

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paciente não encontrado',
          message: 'O paciente que você está tentando excluir não existe'
        },
        { status: 404 }
      )
    }

    // Excluir do banco de dados
    await db
      .delete(patients)
      .where(eq(patients.id, id))

    return NextResponse.json({
      success: true,
      message: 'Paciente excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir paciente:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o paciente'
      },
      { status: 500 }
    )
  }
}
