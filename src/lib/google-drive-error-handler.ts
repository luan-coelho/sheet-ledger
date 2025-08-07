import { NextResponse } from 'next/server'

/**
 * Trata erros relacionados ao Google Drive de forma consistente
 * @param error - O erro capturado
 * @param defaultMessage - Mensagem padrão para erros gerais
 * @returns NextResponse apropriado para o tipo de erro
 */
export function handleGoogleDriveError(error: unknown, defaultMessage: string): NextResponse {
  console.error(`Erro no Google Drive: ${defaultMessage}`, error)

  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

  // Se for erro de reautorização necessária, retornar resposta específica
  if (errorMessage === 'REAUTH_REQUIRED') {
    return NextResponse.json(
      {
        success: false,
        message: 'Google Drive não configurado',
        error: 'REAUTH_REQUIRED',
        authRequired: true,
      },
      { status: 401 },
    )
  }

  // Se for erro de configuração não encontrada
  if (errorMessage === 'Google Drive não configurado') {
    return NextResponse.json(
      {
        success: false,
        message: 'Google Drive não configurado',
        error: 'NOT_CONFIGURED',
        authRequired: true,
      },
      { status: 401 },
    )
  }

  // Erro geral
  return NextResponse.json(
    {
      success: false,
      message: defaultMessage,
      error: errorMessage,
    },
    { status: 500 },
  )
}
