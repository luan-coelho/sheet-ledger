import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthPlansTable, insertHealthPlanSchema } from '@/lib/schemas/health-plan-schema'
import { eq } from 'drizzle-orm'

// GET /api/planos-saude/[id] - Buscar plano de saúde por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const [healthPlan] = await db
      .select()
      .from(healthPlansTable)
      .where(eq(healthPlansTable.id, id))
      .limit(1)

    if (!healthPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plano de saúde não encontrado',
          message: 'O plano de saúde solicitado não existe'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: healthPlan,
      message: 'Plano de saúde encontrado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar plano de saúde:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o plano de saúde'
      },
      { status: 500 }
    )
  }
}

// PUT /api/planos-saude/[id] - Atualizar plano de saúde
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertHealthPlanSchema.parse(body)
    
    // Verificar se o plano de saúde existe
    const [existingHealthPlan] = await db
      .select()
      .from(healthPlansTable)
      .where(eq(healthPlansTable.id, id))
      .limit(1)

    if (!existingHealthPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plano de saúde não encontrado',
          message: 'O plano de saúde que você está tentando atualizar não existe'
        },
        { status: 404 }
      )
    }

    // Atualizar no banco de dados
    const [updatedHealthPlan] = await db
      .update(healthPlansTable)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(healthPlansTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedHealthPlan,
      message: 'Plano de saúde atualizado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar plano de saúde:', error)
    
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
        message: 'Não foi possível atualizar o plano de saúde'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/planos-saude/[id] - Excluir plano de saúde
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o plano de saúde existe
    const [existingHealthPlan] = await db
      .select()
      .from(healthPlansTable)
      .where(eq(healthPlansTable.id, id))
      .limit(1)

    if (!existingHealthPlan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plano de saúde não encontrado',
          message: 'O plano de saúde que você está tentando excluir não existe'
        },
        { status: 404 }
      )
    }

    // Excluir do banco de dados
    await db
      .delete(healthPlansTable)
      .where(eq(healthPlansTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Plano de saúde excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir plano de saúde:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o plano de saúde'
      },
      { status: 500 }
    )
  }
}
