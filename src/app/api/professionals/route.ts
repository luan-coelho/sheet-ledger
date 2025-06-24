import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { professionalsTable, insertProfessionalSchema } from '@/app/db/schemas/professional-schema'
import { desc } from 'drizzle-orm'

// GET /api/professionals - List all professionals
export async function GET() {
  try {
    const allProfessionals = await db.select().from(professionalsTable).orderBy(desc(professionalsTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allProfessionals,
      message: 'Professionals listed successfully',
    })
  } catch (error) {
    console.error('Error fetching professionals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch professionals',
      },
      { status: 500 },
    )
  }
}

// POST /api/professionals - Create new professional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertProfessionalSchema.parse(body)

    // Insert into database
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
        message: 'Professional created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating professional:', error)

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
        message: 'Could not create professional',
      },
      { status: 500 },
    )
  }
}
