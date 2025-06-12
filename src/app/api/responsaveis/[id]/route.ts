import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guardians, insertGuardianSchema } from '@/lib/schemas/guardian-schema'
import { eq } from 'drizzle-orm'

// GET /api/responsaveis/[id] - Buscar responsável por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const [guardian] = await db
      .select()
      .from(guardians)
      .where(eq(guardians.id, id))
      .limit(1)

    if (!guardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Responsável não encontrado',
          message: 'O responsável solicitado não existe'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: guardian,
      message: 'Responsável encontrado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar responsável:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o responsável'
      },
      { status: 500 }
    )
  }
}

// PUT /api/responsaveis/[id] - Atualizar responsável
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertGuardianSchema.parse(body)
    
    // Verificar se o responsável existe
    const [existingGuardian] = await db
      .select()
      .from(guardians)
      .where(eq(guardians.id, id))
      .limit(1)

    if (!existingGuardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Responsável não encontrado',
          message: 'O responsável que você está tentando atualizar não existe'
        },
        { status: 404 }
      )
    }

    // Atualizar no banco de dados
    const [updatedGuardian] = await db
      .update(guardians)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(guardians.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedGuardian,
      message: 'Responsável atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar responsável:', error)
    
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
        message: 'Não foi possível atualizar o responsável'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/responsaveis/[id] - Excluir responsável
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o responsável existe
    const [existingGuardian] = await db
      .select()
      .from(guardians)
      .where(eq(guardians.id, id))
      .limit(1)

    if (!existingGuardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Responsável não encontrado',
          message: 'O responsável que você está tentando excluir não existe'
        },
        { status: 404 }
      )
    }

    // Excluir do banco de dados
    await db
      .delete(guardians)
      .where(eq(guardians.id, id))

    return NextResponse.json({
      success: true,
      message: 'Responsável excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir responsável:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o responsável'
      },
      { status: 500 }
    )
  }
}
