import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { billingsTable, healthPlansTable, patientsTable, therapiesTable, updateBillingSchema } from '@/app/db/schemas'

// GET /api/billings/[id] - Get billing by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [billing] = await db
      .select({
        id: billingsTable.id,
        patientId: billingsTable.patientId,
        patientName: patientsTable.name,
        therapyId: billingsTable.therapyId,
        therapyName: therapiesTable.name,
        customTherapyName: billingsTable.customTherapyName,
        healthPlanId: billingsTable.healthPlanId,
        healthPlanName: healthPlansTable.name,
        billingCycle: billingsTable.billingCycle,
        sessionValueCents: billingsTable.sessionValueCents,
        grossAmountCents: billingsTable.grossAmountCents,
        netAmountCents: billingsTable.netAmountCents,
        dueDate: billingsTable.dueDate,
        invoiceIssuedAt: billingsTable.invoiceIssuedAt,
        invoiceNumber: billingsTable.invoiceNumber,
        competenceDate: billingsTable.competenceDate,
        billerName: billingsTable.billerName,
        status: billingsTable.status,
        isBilled: billingsTable.isBilled,
        notes: billingsTable.notes,
        createdAt: billingsTable.createdAt,
        updatedAt: billingsTable.updatedAt,
      })
      .from(billingsTable)
      .leftJoin(patientsTable, eq(billingsTable.patientId, patientsTable.id))
      .leftJoin(therapiesTable, eq(billingsTable.therapyId, therapiesTable.id))
      .leftJoin(healthPlansTable, eq(billingsTable.healthPlanId, healthPlansTable.id))
      .where(eq(billingsTable.id, id))
      .limit(1)

    if (!billing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Billing not found',
          message: 'The requested billing does not exist',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: billing,
      message: 'Billing found successfully',
    })
  } catch (error) {
    console.error('Error fetching billing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch the billing',
      },
      { status: 500 },
    )
  }
}

// PUT /api/billings/[id] - Update billing
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = updateBillingSchema.parse({ ...body, id })

    // Check if billing exists
    const [existingBilling] = await db.select().from(billingsTable).where(eq(billingsTable.id, id)).limit(1)

    if (!existingBilling) {
      return NextResponse.json(
        {
          success: false,
          error: 'Billing not found',
          message: 'The billing you are trying to update does not exist',
        },
        { status: 404 },
      )
    }

    // Convert currency values to cents if provided
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validatedData.patientId) updateData.patientId = validatedData.patientId
    if (validatedData.therapyId !== undefined) updateData.therapyId = validatedData.therapyId || null
    if (validatedData.customTherapyName !== undefined)
      updateData.customTherapyName = validatedData.customTherapyName || null
    if (validatedData.healthPlanId !== undefined) updateData.healthPlanId = validatedData.healthPlanId || null
    if (validatedData.billingCycle !== undefined) updateData.billingCycle = validatedData.billingCycle || null

    if (validatedData.sessionValue !== undefined) {
      updateData.sessionValueCents = Math.round(validatedData.sessionValue * 100)
    }
    if (validatedData.grossAmount !== undefined) {
      updateData.grossAmountCents = Math.round(validatedData.grossAmount * 100)
    }
    if (validatedData.netAmount !== undefined) {
      updateData.netAmountCents = validatedData.netAmount ? Math.round(validatedData.netAmount * 100) : null
    }

    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate?.toISOString().split('T')[0] || null
    }
    if (validatedData.invoiceIssuedAt !== undefined) {
      updateData.invoiceIssuedAt = validatedData.invoiceIssuedAt?.toISOString().split('T')[0] || null
    }
    if (validatedData.invoiceNumber !== undefined) updateData.invoiceNumber = validatedData.invoiceNumber || null
    if (validatedData.competenceDate !== undefined) {
      updateData.competenceDate = validatedData.competenceDate?.toISOString().split('T')[0] || null
    }
    if (validatedData.billerName !== undefined) updateData.billerName = validatedData.billerName || null
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.isBilled !== undefined) updateData.isBilled = validatedData.isBilled
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes || null

    // Update in database
    const [updatedBilling] = await db.update(billingsTable).set(updateData).where(eq(billingsTable.id, id)).returning()

    return NextResponse.json({
      success: true,
      data: updatedBilling,
      message: 'Billing updated successfully',
    })
  } catch (error) {
    console.error('Error updating billing:', error)

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
        message: 'Could not update the billing',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/billings/[id] - Delete billing
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if billing exists
    const [existingBilling] = await db.select().from(billingsTable).where(eq(billingsTable.id, id)).limit(1)

    if (!existingBilling) {
      return NextResponse.json(
        {
          success: false,
          error: 'Billing not found',
          message: 'The billing you are trying to delete does not exist',
        },
        { status: 404 },
      )
    }

    // Delete from database
    await db.delete(billingsTable).where(eq(billingsTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Billing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting billing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not delete the billing',
      },
      { status: 500 },
    )
  }
}
