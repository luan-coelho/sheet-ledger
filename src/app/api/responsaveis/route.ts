import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guardiansTable, insertGuardianSchema } from '@/lib/schemas/guardian-schema'
import { desc } from 'drizzle-orm'

// GET /api/responsaveis - Listar todos os responsáveis
export async function GET() {
  try {
    const allGuardians = await db
      .select()
      .from(guardiansTable)
      .orderBy(desc(guardiansTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allGuardians,
      message: 'Responsáveis listados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar responsáveis:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os responsáveis'
      },
      { status: 500 }
    )
  }
}

// POST /api/responsaveis - Criar novo responsável
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertGuardianSchema.parse(body)
    
    // Inserir no banco de dados
    const [newGuardian] = await db
      .insert(guardiansTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newGuardian,
        message: 'Responsável criado com sucesso'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar responsável:', error)
    
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
        message: 'Não foi possível criar o responsável'
      },
      { status: 500 }
    )
  }
}
