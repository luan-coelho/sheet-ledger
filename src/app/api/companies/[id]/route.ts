import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { companiesTable, insertCompanySchema } from '@/app/db/schemas/company-schema'

// GET /api/companies/[id] - Get company by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, id)).limit(1)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          message: 'The requested company does not exist',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Company found successfully',
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch the company',
      },
      { status: 500 },
    )
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertCompanySchema.parse(body)

    // Check if company exists
    const [existingCompany] = await db.select().from(companiesTable).where(eq(companiesTable.id, id)).limit(1)

    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          message: 'The company you are trying to update does not exist',
        },
        { status: 404 },
      )
    }

    // Update in database
    const [updatedCompany] = await db
      .update(companiesTable)
      .set({
        name: validatedData.name,
        cnpj: validatedData.cnpj,
        address: validatedData.address,
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedCompany,
      message: 'Company updated successfully',
    })
  } catch (error) {
    console.error('Error updating company:', error)

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
        message: 'Could not update the company',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if company exists
    const [existingCompany] = await db.select().from(companiesTable).where(eq(companiesTable.id, id)).limit(1)

    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          message: 'The company you are trying to delete does not exist',
        },
        { status: 404 },
      )
    }

    // Delete from database
    await db.delete(companiesTable).where(eq(companiesTable.id, id))

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not delete the company',
      },
      { status: 500 },
    )
  }
}
