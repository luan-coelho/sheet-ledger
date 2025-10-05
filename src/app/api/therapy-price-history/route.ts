import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  insertTherapyPriceHistorySchema,
  therapyPriceHistoryTable,
  TherapyPriceHistoryWithFormatted,
} from '@/app/db/schemas/therapy-price-history-schema'
import { therapiesTable } from '@/app/db/schemas/therapy-schema'

// GET /api/therapy-price-history - List therapy price history
// Query params: therapyId (required), startCompetence (optional), endCompetence (optional)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const therapyId = searchParams.get('therapyId')
    const startCompetence = searchParams.get('startCompetence')
    const endCompetence = searchParams.get('endCompetence')

    if (!therapyId) {
      return NextResponse.json({ error: 'therapyId é obrigatório' }, { status: 400 })
    }

    // Build where conditions
    const conditions = [eq(therapyPriceHistoryTable.therapyId, therapyId)]

    if (startCompetence) {
      conditions.push(gte(therapyPriceHistoryTable.competence, startCompetence))
    }

    if (endCompetence) {
      conditions.push(lte(therapyPriceHistoryTable.competence, endCompetence))
    }

    // Query with therapy details
    const priceHistory = await db
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
      .where(and(...conditions))
      .orderBy(desc(therapyPriceHistoryTable.competence))

    // Format response with value in reais
    const formattedHistory: TherapyPriceHistoryWithFormatted[] = priceHistory.map(item => ({
      ...item,
      value: item.valueCents / 100,
    }))

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error('Error fetching therapy price history:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/therapy-price-history - Create new therapy price history entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = insertTherapyPriceHistorySchema.parse(body)

    // Check if therapy exists
    const therapy = await db
      .select()
      .from(therapiesTable)
      .where(eq(therapiesTable.id, validatedData.therapyId))
      .limit(1)

    if (therapy.length === 0) {
      return NextResponse.json({ error: 'Terapia não encontrada' }, { status: 404 })
    }

    // Check if price for this competence already exists
    const existingPrice = await db
      .select()
      .from(therapyPriceHistoryTable)
      .where(
        and(
          eq(therapyPriceHistoryTable.therapyId, validatedData.therapyId),
          eq(therapyPriceHistoryTable.competence, validatedData.competence),
        ),
      )
      .limit(1)

    if (existingPrice.length > 0) {
      return NextResponse.json(
        {
          error: 'Já existe um valor cadastrado para esta terapia nesta competência',
          details: 'Use PUT para atualizar o valor existente',
        },
        { status: 409 },
      )
    }

    // Convert value from reais to cents
    const valueCents = Math.round(validatedData.value * 100)

    // Insert into database
    const [priceHistory] = await db
      .insert(therapyPriceHistoryTable)
      .values({
        therapyId: validatedData.therapyId,
        competence: validatedData.competence,
        valueCents,
      })
      .returning()

    // Return with formatted value
    const response: TherapyPriceHistoryWithFormatted = {
      ...priceHistory,
      value: priceHistory.valueCents / 100,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating therapy price history:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
