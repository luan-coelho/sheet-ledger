import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { guardiansTable, insertGuardianSchema } from '@/app/db/schemas/guardian-schema'
import { eq } from 'drizzle-orm'

// GET /api/guardians/[id] - Get guardian by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [guardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, id)).limit(1)

    if (!guardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guardian not found',
          message: 'The requested guardian does not exist',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: guardian,
      message: 'Guardian found successfully',
    })
  } catch (error) {
    console.error('Error fetching guardian:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch the guardian',
      },
      { status: 500 },
    )
  }
}

// PUT /api/guardians/[id] - Update guardian
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertGuardianSchema.parse(body)

    // Check if guardian exists
    const [existingGuardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, id)).limit(1)

    if (!existingGuardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guardian not found',
          message: 'The guardian you are trying to update does not exist',
        },
        { status: 404 },
      )
    }

    // Update in database
    const [updatedGuardian] = await db
      .update(guardiansTable)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(guardiansTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedGuardian,
      message: 'Guardian updated successfully',
    })
  } catch (error) {
    console.error('Error updating guardian:', error)

    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          message: 'Please check the provided data',
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not update the guardian',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/guardians/[id] - Delete guardian
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if guardian exists
    const [existingGuardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, id)).limit(1)

    if (!existingGuardian) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guardian not found',
          message: 'The guardian you are trying to delete does not exist',
        },
        { status: 404 },
      )
    }

    // Delete from database
    await db.delete(guardiansTable).where(eq(guardiansTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Guardian deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting guardian:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not delete the guardian',
      },
      { status: 500 },
    )
  }
}
