import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthPlans, insertHealthPlanSchema } from '@/lib/schemas/health-plan-schema'
import { desc } from 'drizzle-orm'

// GET /api/planos-saude - Listar todos os planos de saúde
export async function GET() {
  try {
    const allHealthPlans = await db
      .select()
      .from(healthPlans)
      .orderBy(desc(healthPlans.createdAt))

    return NextResponse.json({
      success: true,
      data: allHealthPlans,
      message: 'Planos de saúde listados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar planos de saúde:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os planos de saúde'
      },
      { status: 500 }
    )
  }
}

// POST /api/planos-saude - Criar novo plano de saúde
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertHealthPlanSchema.parse(body)
    
    // Inserir no banco de dados
    const [newHealthPlan] = await db
      .insert(healthPlans)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newHealthPlan,
        message: 'Plano de saúde criado com sucesso'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar plano de saúde:', error)
    
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
        message: 'Não foi possível criar o plano de saúde'
      },
      { status: 500 }
    )
  }
}
