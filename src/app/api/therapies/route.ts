import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertTherapySchema, therapiesTable } from '@/app/db/schemas/therapy-schema'

// GET /api/therapies - List all therapies
export async function GET() {
  try {
    const therapies = await db.select().from(therapiesTable).orderBy(desc(therapiesTable.createdAt))

    return NextResponse.json(therapies)
  } catch (error) {
    console.error('Error fetching therapies:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/therapies - Create new therapy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = insertTherapySchema.parse(body)

    // Insert into database
    const [therapy] = await db.insert(therapiesTable).values(validatedData).returning()

    return NextResponse.json(therapy, { status: 201 })
  } catch (error) {
    console.error('Error creating therapy:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
