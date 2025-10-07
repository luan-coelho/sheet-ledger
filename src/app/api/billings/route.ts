import { asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { billingsTable, healthPlansTable, insertBillingSchema, patientsTable, therapiesTable } from '@/app/db/schemas'

// GET /api/billings - List all billings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const patientId = searchParams.get('patientId')
    const dueDateFrom = searchParams.get('dueDateFrom')
    const dueDateTo = searchParams.get('dueDateTo')

    let query = db
      .select({
        id: billingsTable.id,
        patientId: billingsTable.patientId,
        patientName: patientsTable.name,
        therapyId: billingsTable.therapyId,
        therapyName: therapiesTable.name,
        customTherapyName: billingsTable.customTherapyName,
        healthPlanId: billingsTable.healthPlanId,
        healthPlanName: healthPlansTable.name,
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

    // Apply filters
    const conditions = []

    if (status) {
      conditions.push(eq(billingsTable.status, status as any))
    }

    if (patientId) {
      conditions.push(eq(billingsTable.patientId, patientId))
    }

    if (dueDateFrom) {
      conditions.push(gte(billingsTable.dueDate, dueDateFrom))
    }

    if (dueDateTo) {
      conditions.push(lte(billingsTable.dueDate, dueDateTo))
    }

    if (conditions.length > 0) {
      query = query.where(sql`${sql.join(conditions, sql` AND `)}`) as any
    }

    // Order by priority: 1=overdue, 2=pending, 3=paid/cancelled
    // Then by due date (closest first)
    const allBillings = await query.orderBy(
      sql`
        CASE
          WHEN ${billingsTable.dueDate} < CURRENT_DATE
            AND ${billingsTable.status} NOT IN ('paid', 'cancelled')
          THEN 1
          WHEN ${billingsTable.status} IN ('pending', 'scheduled', 'sent')
          THEN 2
          ELSE 3
        END ASC,
        ${billingsTable.dueDate} ASC NULLS LAST
      `,
    )

    // Calculate summary
    const summary = await db
      .select({
        totalGrossCents: sql<number>`COALESCE(SUM(${billingsTable.grossAmountCents}), 0)`,
        totalNetCents: sql<number>`COALESCE(SUM(${billingsTable.netAmountCents}), 0)`,
        overdueCount: sql<number>`COUNT(CASE WHEN ${billingsTable.dueDate} < CURRENT_DATE AND ${billingsTable.status} NOT IN ('paid', 'cancelled') THEN 1 END)`,
        pendingCount: sql<number>`COUNT(CASE WHEN ${billingsTable.status} = 'pending' THEN 1 END)`,
        paidCount: sql<number>`COUNT(CASE WHEN ${billingsTable.status} = 'paid' THEN 1 END)`,
      })
      .from(billingsTable)
      .where(
        conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : sql`TRUE`, // Fallback para não filtrar nada
      )

    return NextResponse.json({
      success: true,
      data: allBillings,
      summary: summary[0] || {
        totalGrossCents: 0,
        totalNetCents: 0,
        overdueCount: 0,
        pendingCount: 0,
        paidCount: 0,
      },
      message: 'Billings listed successfully',
    })
  } catch (error) {
    console.error('Error fetching billings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch billings',
      },
      { status: 500 },
    )
  }
}

// POST /api/billings - Create new billing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertBillingSchema.parse(body)

    // Convert currency values to cents
    const sessionValueCents = Math.round(validatedData.sessionValue * 100)
    const grossAmountCents = Math.round(validatedData.grossAmount * 100)
    const netAmountCents = validatedData.netAmount ? Math.round(validatedData.netAmount * 100) : null

    // Insert into database
    const [newBilling] = await db
      .insert(billingsTable)
      .values({
        patientId: validatedData.patientId,
        therapyId: validatedData.therapyId || null,
        customTherapyName: validatedData.customTherapyName || null,
        healthPlanId: validatedData.healthPlanId || null,
        sessionValueCents,
        grossAmountCents,
        netAmountCents,
        dueDate: validatedData.dueDate?.toISOString().split('T')[0] || null,
        invoiceIssuedAt: validatedData.invoiceIssuedAt?.toISOString().split('T')[0] || null,
        invoiceNumber: validatedData.invoiceNumber || null,
        competenceDate: validatedData.competenceDate?.toISOString().split('T')[0] || null,
        billerName: validatedData.billerName || null,
        status: validatedData.status,
        isBilled: validatedData.isBilled ?? false,
        notes: validatedData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newBilling,
        message: 'Billing created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating billing:', error)

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
        message: 'Could not create billing',
      },
      { status: 500 },
    )
  }
}
