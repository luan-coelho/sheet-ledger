import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { insertPatientSchema, patientsTable } from '@/app/db/schemas/patient-schema'
import { professionalsTable } from '@/app/db/schemas/professional-schema'

// GET /api/patients/[id] - Get patient by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [patient] = await db
      .select({
        id: patientsTable.id,
        name: patientsTable.name,
        professionalId: patientsTable.professionalId,
        createdAt: patientsTable.createdAt,
        updatedAt: patientsTable.updatedAt,
        professional: {
          id: professionalsTable.id,
          name: professionalsTable.name,
          councilNumber: professionalsTable.councilNumber,
        },
      })
      .from(patientsTable)
      .leftJoin(professionalsTable, eq(patientsTable.professionalId, professionalsTable.id))
      .where(eq(patientsTable.id, id))
      .limit(1)

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          message: 'The requested patient does not exist',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: patient,
      message: 'Patient found successfully',
    })
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch the patient',
      },
      { status: 500 },
    )
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertPatientSchema.parse(body)

    // Check if patient exists
    const [existingPatient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1)

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          message: 'The patient you are trying to update does not exist',
        },
        { status: 404 },
      )
    }

    // Update in database
    const [updatedPatient] = await db
      .update(patientsTable)
      .set({
        name: validatedData.name,
        professionalId: validatedData.professionalId,
        updatedAt: new Date(),
      })
      .where(eq(patientsTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedPatient,
      message: 'Patient updated successfully',
    })
  } catch (error) {
    console.error('Error updating patient:', error)

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
        message: 'Could not update the patient',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if patient exists
    const [existingPatient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1)

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
          message: 'The patient you are trying to delete does not exist',
        },
        { status: 404 },
      )
    }

    // Delete from database
    await db.delete(patientsTable).where(eq(patientsTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not delete the patient',
      },
      { status: 500 },
    )
  }
}
