import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { healthPlansTable, insertHealthPlanSchema } from '@/app/db/schemas/health-plan-schema'
import { desc } from 'drizzle-orm'

// GET /api/health-plans - List all health plans
export async function GET() {
  try {
    const allHealthPlans = await db.select().from(healthPlansTable).orderBy(desc(healthPlansTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allHealthPlans,
      message: 'Health plans listed successfully',
    })
  } catch (error) {
    console.error('Error fetching health plans:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch health plans',
      },
      { status: 500 },
    )
  }
}

// POST /api/health-plans - Create new health plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertHealthPlanSchema.parse(body)

    // Insert into database
    const [newHealthPlan] = await db
      .insert(healthPlansTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newHealthPlan,
        message: 'Health plan created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating health plan:', error)

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
        message: 'Could not create health plan',
      },
      { status: 500 },
    )
  }
}
