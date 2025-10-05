import { and, eq, lte } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import {
  getTherapyPriceByCompetenceSchema,
  therapyPriceHistoryTable,
  TherapyPriceHistoryWithFormatted,
} from '@/app/db/schemas/therapy-price-history-schema'
import { therapiesTable } from '@/app/db/schemas/therapy-schema'

/**
 * GET /api/therapy-price-history/by-competence
 *
 * Busca o valor de uma terapia para uma competência específica.
 * Se não houver valor exato para a competência, retorna o valor mais recente anterior.
 *
 * Query params:
 * - therapyId: UUID da terapia (obrigatório)
 * - competence: Competência no formato YYYY-MM (obrigatório)
 *
 * Exemplo de uso:
 * GET /api/therapy-price-history/by-competence?therapyId=123&competence=2025-03
 *
 * Se houver valores cadastrados para 2025-01 (150) e 2025-03 (170):
 * - competence=2025-01 retorna 150
 * - competence=2025-02 retorna 150 (valor mais recente anterior)
 * - competence=2025-03 retorna 170
 * - competence=2025-04 retorna 170 (valor mais recente)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const therapyId = searchParams.get('therapyId')
    const competence = searchParams.get('competence')

    if (!therapyId || !competence) {
      return NextResponse.json({ error: 'therapyId e competence são obrigatórios' }, { status: 400 })
    }

    // Validate parameters
    try {
      getTherapyPriceByCompetenceSchema.parse({ therapyId, competence })
    } catch (validationError) {
      return NextResponse.json({ error: 'Parâmetros inválidos', details: validationError }, { status: 400 })
    }

    // Check if therapy exists
    const [therapy] = await db.select().from(therapiesTable).where(eq(therapiesTable.id, therapyId)).limit(1)

    if (!therapy) {
      return NextResponse.json({ error: 'Terapia não encontrada' }, { status: 404 })
    }

    // First, try to find exact match
    const [exactMatch] = await db
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
      .where(
        and(eq(therapyPriceHistoryTable.therapyId, therapyId), eq(therapyPriceHistoryTable.competence, competence)),
      )
      .limit(1)

    if (exactMatch) {
      const response: TherapyPriceHistoryWithFormatted = {
        ...exactMatch,
        value: exactMatch.valueCents / 100,
      }
      return NextResponse.json(response)
    }

    // If no exact match, find the most recent price before or equal to the competence
    const [closestMatch] = await db
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
      .where(
        and(eq(therapyPriceHistoryTable.therapyId, therapyId), lte(therapyPriceHistoryTable.competence, competence)),
      )
      .orderBy(therapyPriceHistoryTable.competence)
      .limit(1)

    if (!closestMatch) {
      return NextResponse.json(
        {
          error: 'Nenhum valor encontrado',
          details: `Não há valores cadastrados para a terapia "${therapy.name}" até a competência ${competence}`,
        },
        { status: 404 },
      )
    }

    const response: TherapyPriceHistoryWithFormatted = {
      ...closestMatch,
      value: closestMatch.valueCents / 100,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching therapy price by competence:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
