import { NextResponse } from 'next/server'
import { getDatabaseInfo } from '@/lib/db-health'

export async function GET() {
  try {
    const dbInfo = await getDatabaseInfo()
    
    return NextResponse.json(dbInfo, {
      status: dbInfo.status === 'error' ? 500 : 200,
    })
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
} 