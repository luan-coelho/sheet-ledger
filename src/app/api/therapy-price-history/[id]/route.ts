import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  therapyPriceHistoryTable,
  TherapyPriceHistoryWithFormatted,
  updateTherapyPriceHistorySchema,
} from '@/app/db/schemas/therapy-price-history-schema'
import { therapiesTable } from '@/app/db/schemas/therapy-schema'

// GET /api/therapy-price-history/[id] - Get therapy price history by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [priceHistory] = await db
      .select({
        id: therapyPriceHistoryTable.id,
        therapyId: therapyPriceHistoryTable.therapyId,
        therapyName: therapiesTable.name,
        competence: therapyPriceHistoryTable.competence,
        valueCents: therapyPriceHistoryTable.valueCents,
        createdAt: therapyPriceHistoryTable.createdAt,
        updatedAt: therapyPriceHistoryTable.updatedAt,
      })
      .from(therapyPriceHistoryTable)
      .leftJoin(therapiesTable, eq(therapyPriceHistoryTable.therapyId, therapiesTable.id))
      .where(eq(therapyPriceHistoryTable.id, id))
      .limit(1)

    if (!priceHistory) {
      return NextResponse.json({ error: 'Histórico de preço não encontrado' }, { status: 404 })
    }

    const response: TherapyPriceHistoryWithFormatted = {
      ...priceHistory,
      value: priceHistory.valueCents / 100,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching therapy price history:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/therapy-price-history/[id] - Update therapy price history
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validatedData = updateTherapyPriceHistorySchema.parse({ ...body, id })

    // Check if record exists
    const [existing] = await db
      .select()
      .from(therapyPriceHistoryTable)
      .where(eq(therapyPriceHistoryTable.id, id))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Histórico de preço não encontrado' }, { status: 404 })
    }

    // If competence is being changed, check for duplicates
    if (validatedData.competence && validatedData.competence !== existing.competence) {
      const duplicate = await db
        .select()
        .from(therapyPriceHistoryTable)
        .where(
          and(
            eq(therapyPriceHistoryTable.therapyId, existing.therapyId),
            eq(therapyPriceHistoryTable.competence, validatedData.competence),
          ),
        )
        .limit(1)

      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: 'Já existe um valor cadastrado para esta terapia nesta competência' },
          { status: 409 },
        )
      }
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (validatedData.competence) {
      updateData.competence = validatedData.competence
    }

    if (validatedData.value !== undefined) {
      updateData.valueCents = Math.round(validatedData.value * 100)
    }

    // Update database
    const [updated] = await db
      .update(therapyPriceHistoryTable)
      .set(updateData)
      .where(eq(therapyPriceHistoryTable.id, id))
      .returning()

    const response: TherapyPriceHistoryWithFormatted = {
      ...updated,
      value: updated.valueCents / 100,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating therapy price history:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/therapy-price-history/[id] - Delete therapy price history
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if record exists
    const [existing] = await db
      .select()
      .from(therapyPriceHistoryTable)
      .where(eq(therapyPriceHistoryTable.id, id))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Histórico de preço não encontrado' }, { status: 404 })
    }

    // Delete from database
    await db.delete(therapyPriceHistoryTable).where(eq(therapyPriceHistoryTable.id, id))

    return NextResponse.json({ message: 'Histórico de preço deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting therapy price history:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
