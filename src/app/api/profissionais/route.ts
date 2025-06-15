import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { professionalsTable, insertProfessionalSchema } from '@/lib/schemas/professional-schema'
import { desc } from 'drizzle-orm'

// GET /api/profissionais - Listar todos os profissionais
export async function GET() {
  try {
    const allProfessionals = await db
      .select()
      .from(professionalsTable)
      .orderBy(desc(professionalsTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allProfessionals,
      message: 'Profissionais listados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os profissionais'
      },
      { status: 500 }
    )
  }
}

// POST /api/profissionais - Criar novo profissional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados usando Zod schema
    const validatedData = insertProfessionalSchema.parse(body)
    
    // Inserir no banco de dados
    const [newProfessional] = await db
      .insert(professionalsTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newProfessional,
        message: 'Profissional criado com sucesso'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar profissional:', error)
    
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
        message: 'Não foi possível criar o profissional'
      },
      { status: 500 }
    )
  }
}
