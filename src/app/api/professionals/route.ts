import { desc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertProfessionalSchema, professionalsTable } from '@/app/db/schemas/professional-schema'
import { therapiesTable } from '@/app/db/schemas/therapy-schema'

// GET /api/professionals - List all professionals
export async function GET() {
  try {
    const allProfessionals = await db
      .select({
        id: professionalsTable.id,
        name: professionalsTable.name,
        councilNumber: professionalsTable.councilNumber,
        therapyId: professionalsTable.therapyId,
        therapy: {
          id: therapiesTable.id,
          name: therapiesTable.name,
        },
        createdAt: professionalsTable.createdAt,
        updatedAt: professionalsTable.updatedAt,
      })
      .from(professionalsTable)
      .leftJoin(therapiesTable, eq(professionalsTable.therapyId, therapiesTable.id))
      .orderBy(desc(professionalsTable.createdAt))

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
        councilNumber: validatedData.councilNumber,
        therapyId: validatedData.therapyId || null,
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
