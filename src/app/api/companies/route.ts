import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { companiesTable, insertCompanySchema } from '@/app/db/schemas/company-schema'

// GET /api/companies - List all companies
export async function GET() {
  try {
    const allCompanies = await db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt))

    return NextResponse.json({
      success: true,
      data: allCompanies,
      message: 'Companies listed successfully',
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch companies',
      },
      { status: 500 },
    )
  }
}

// POST /api/companies - Create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate data using Zod schema
    const validatedData = insertCompanySchema.parse(body)

    // Insert into database
    const [newCompany] = await db
      .insert(companiesTable)
      .values({
        name: validatedData.name,
        cnpj: validatedData.cnpj,
        address: validatedData.address,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        data: newCompany,
        message: 'Company created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating company:', error)

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
        message: 'Could not create the company',
      },
      { status: 500 },
    )
  }
}
