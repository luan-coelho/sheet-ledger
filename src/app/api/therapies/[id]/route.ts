import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertTherapySchema, therapiesTable } from '@/app/db/schemas/therapy-schema'

// GET /api/therapies/[id] - Get therapy by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const [therapy] = await db.select().from(therapiesTable).where(eq(therapiesTable.id, id))

    if (!therapy) {
      return NextResponse.json({ error: 'Terapia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(therapy)
  } catch (error) {
    console.error('Error fetching therapy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/therapies/[id] - Update therapy
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate request body
    const validatedData = insertTherapySchema.parse(body)

    // Update in database
    const [therapy] = await db
      .update(therapiesTable)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(therapiesTable.id, id))
      .returning()

    if (!therapy) {
      return NextResponse.json({ error: 'Terapia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(therapy)
  } catch (error) {
    console.error('Error updating therapy:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/therapies/[id] - Delete therapy
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const [deletedTherapy] = await db.delete(therapiesTable).where(eq(therapiesTable.id, id)).returning()

    if (!deletedTherapy) {
      return NextResponse.json({ error: 'Terapia não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Terapia excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting therapy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
