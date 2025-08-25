import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  insertProfessionalTherapySchema,
  professionalTherapiesTable,
} from '@/app/db/schemas/professional-therapy-schema'

// GET /api/professionals/[id]/therapies - Get therapies for a professional
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID do profissional é obrigatório' }, { status: 400 })
    }

    const result = await db
      .select({
        therapyId: professionalTherapiesTable.therapyId,
      })
      .from(professionalTherapiesTable)
      .where(eq(professionalTherapiesTable.professionalId, id))

    const therapyIds = result.map(row => row.therapyId)

    return NextResponse.json({
      success: true,
      data: therapyIds,
      message: 'Terapias do profissional obtidas com sucesso',
    })
  } catch (error) {
    console.error('Error fetching professional therapies:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// POST /api/professionals/[id]/therapies - Add therapy to professional
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do profissional é obrigatório' }, { status: 400 })
    }

    if (!body.therapyId) {
      return NextResponse.json({ error: 'ID da terapia é obrigatório' }, { status: 400 })
    }

    const validatedData = insertProfessionalTherapySchema.parse({
      professionalId: id,
      therapyId: body.therapyId,
    })

    // Verificar se a relação já existe
    const existing = await db
      .select()
      .from(professionalTherapiesTable)
      .where(
        and(
          eq(professionalTherapiesTable.professionalId, validatedData.professionalId),
          eq(professionalTherapiesTable.therapyId, validatedData.therapyId),
        ),
      )

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Esta terapia já está associada ao profissional' }, { status: 400 })
    }

    // Inserir nova relação
    const [newRelation] = await db.insert(professionalTherapiesTable).values(validatedData).returning()

    return NextResponse.json(
      {
        success: true,
        data: newRelation,
        message: 'Terapia associada ao profissional com sucesso',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error adding therapy to professional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// PUT /api/professionals/[id]/therapies - Update all therapies for professional
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID do profissional é obrigatório' }, { status: 400 })
    }

    if (!Array.isArray(body.therapyIds)) {
      return NextResponse.json({ error: 'therapyIds deve ser um array' }, { status: 400 })
    }

    // Primeiro, remover todas as terapias existentes do profissional
    await db.delete(professionalTherapiesTable).where(eq(professionalTherapiesTable.professionalId, id))

    // Em seguida, adicionar as novas terapias (se houver)
    if (body.therapyIds.length > 0) {
      const newRelations = body.therapyIds.map((therapyId: string) => ({
        professionalId: id,
        therapyId,
      }))

      await db.insert(professionalTherapiesTable).values(newRelations)
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Terapias do profissional atualizadas com sucesso',
    })
  } catch (error) {
    console.error('Error updating professional therapies:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/professionals/[id]/therapies?therapyId=xxx - Remove therapy from professional
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const therapyId = url.searchParams.get('therapyId')

    if (!id) {
      return NextResponse.json({ error: 'ID do profissional é obrigatório' }, { status: 400 })
    }

    if (!therapyId) {
      return NextResponse.json({ error: 'ID da terapia é obrigatório' }, { status: 400 })
    }

    const result = await db
      .delete(professionalTherapiesTable)
      .where(
        and(eq(professionalTherapiesTable.professionalId, id), eq(professionalTherapiesTable.therapyId, therapyId)),
      )
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Relação entre profissional e terapia não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Terapia removida do profissional com sucesso',
    })
  } catch (error) {
    console.error('Error removing therapy from professional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
