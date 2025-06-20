import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { professionalsTable, insertProfessionalSchema } from '@/app/db/schemas/professional-schema'
import { eq } from 'drizzle-orm'

// GET /api/professionals/[id] - Get professional by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [professional] = await db.select().from(professionalsTable).where(eq(professionalsTable.id, id)).limit(1)

    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Professional not found',
          message: 'The requested professional does not exist',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Professional found successfully',
    })
  } catch (error) {
    console.error('Error fetching professional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch the professional',
      },
      { status: 500 },
    )
  }
}

// PUT /api/professionals/[id] - Update professional
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertProfessionalSchema.parse(body)

    // Check if professional exists
    const [existingProfessional] = await db
      .select()
      .from(professionalsTable)
      .where(eq(professionalsTable.id, id))
      .limit(1)

    if (!existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Professional not found',
          message: 'The professional you are trying to update does not exist',
        },
        { status: 404 },
      )
    }

    // Update in database
    const [updatedProfessional] = await db
      .update(professionalsTable)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(professionalsTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedProfessional,
      message: 'Professional updated successfully',
    })
  } catch (error) {
    console.error('Error updating professional:', error)

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
        message: 'Could not update the professional',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/professionals/[id] - Delete professional
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if professional exists
    const [existingProfessional] = await db
      .select()
      .from(professionalsTable)
      .where(eq(professionalsTable.id, id))
      .limit(1)

    if (!existingProfessional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Professional not found',
          message: 'The professional you are trying to delete does not exist',
        },
        { status: 404 },
      )
    }

    // Delete from database
    await db.delete(professionalsTable).where(eq(professionalsTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Professional deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting professional:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not delete the professional',
      },
      { status: 500 },
    )
  }
} 