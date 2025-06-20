import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { guardiansTable, insertGuardianSchema } from '@/app/db/schemas/guardian-schema'
import { desc } from 'drizzle-orm'

// GET /api/guardians - List all guardians
export async function GET() {
  try {
    const allGuardians = await db.select().from(guardiansTable).orderBy(desc(guardiansTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allGuardians,
      message: 'Guardians listed successfully',
    })
  } catch (error) {
    console.error('Error fetching guardians:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch guardians',
      },
      { status: 500 },
    )
  }
}

// POST /api/guardians - Create new guardian
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertGuardianSchema.parse(body)

    // Insert into database
    const [newGuardian] = await db
      .insert(guardiansTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newGuardian,
        message: 'Guardian created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating guardian:', error)

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
        message: 'Could not create guardian',
      },
      { status: 500 },
    )
  }
}