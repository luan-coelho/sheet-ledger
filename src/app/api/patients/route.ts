import { asc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertPatientSchema, patientsTable } from '@/app/db/schemas/patient-schema'

// GET /api/patients - List all patients
export async function GET() {
  try {
    const allPatients = await db.select().from(patientsTable).orderBy(asc(patientsTable.name))

    return NextResponse.json({
      success: true,
      data: allPatients,
      message: 'Patients listed successfully',
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch patients',
      },
      { status: 500 },
    )
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertPatientSchema.parse(body)

    // Insert into database
    const [newPatient] = await db
      .insert(patientsTable)
      .values({
        name: validatedData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newPatient,
        message: 'Patient created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating patient:', error)

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
        message: 'Could not create patient',
      },
      { status: 500 },
    )
  }
}
