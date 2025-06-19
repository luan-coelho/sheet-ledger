import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { professionalsTable, insertProfessionalSchema } from '@/app/db/schemas/professional-schema'
import { eq } from 'drizzle-orm'

// GET /api/profissionais/[id] - Buscar profissional por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const [professional] = await db.select().from(professionalsTable).where(eq(professionalsTable.id, id)).limit(1)

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profissional não encontrado',
          message: 'O profissional solicitado não existe',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Profissional encontrado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao buscar profissional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o profissional',
      },
      { status: 500 },
    )
  }
}

// PUT /api/profissionais/[id] - Atualizar profissional
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Validar dados usando Zod schema
    const validatedData = insertProfessionalSchema.parse(body)

    // Verificar se o profissional existe
    const [existingProfessional] = await db
      .select()
      .from(professionalsTable)
      .where(eq(professionalsTable.id, id))
      .limit(1)

    if (!existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profissional não encontrado',
          message: 'O profissional que você está tentando atualizar não existe',
        },
        { status: 404 },
      )
    }

    // Atualizar no banco de dados
    const [updatedProfessional] = await db
      .update(professionalsTable)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(professionalsTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedProfessional,
      message: 'Profissional atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error)

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
        message: 'Não foi possível atualizar o profissional',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/profissionais/[id] - Excluir profissional
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verificar se o profissional existe
    const [existingProfessional] = await db
      .select()
      .from(professionalsTable)
      .where(eq(professionalsTable.id, id))
      .limit(1)

    if (!existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profissional não encontrado',
          message: 'O profissional que você está tentando excluir não existe',
        },
        { status: 404 },
      )
    }

    // Excluir do banco de dados
    await db.delete(professionalsTable).where(eq(professionalsTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Profissional excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir profissional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o profissional',
      },
      { status: 500 },
    )
  }
}
