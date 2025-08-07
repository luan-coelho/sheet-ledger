/**
 * Utilitário para tratar erros de API do Google Drive
 * Detecta quando reautorização é necessária e prepara erro adequado
 */

export interface GoogleDriveApiError extends Error {
  authRequired?: boolean
}

/**
 * Processa resposta da API do Google Drive e lança erro apropriado
 * @param response - Response da fetch API
 * @param result - Resultado JSON parseado da resposta
 * @param defaultErrorMessage - Mensagem de erro padrão
 * @throws GoogleDriveApiError com flag authRequired se necessário
 */
export function handleGoogleDriveApiResponse(
  _response: Response,
  result: any,
  defaultErrorMessage = 'Erro na operação',
): void {
  if (!result.success) {
    // Se for erro de reautorização necessária, lançar erro específico
    if (result.error === 'REAUTH_REQUIRED' || result.error === 'NOT_CONFIGURED' || result.authRequired) {
      const error: GoogleDriveApiError = new Error('REAUTH_REQUIRED')
      error.authRequired = true
      throw error
    }

    throw new Error(result.message || defaultErrorMessage)
  }
}

/**
 * Wrapper para fetch de APIs do Google Drive com tratamento de erro consistente
 * @param url - URL da API
 * @param options - Opções da fetch
 * @param defaultErrorMessage - Mensagem de erro padrão
 * @returns Dados da resposta em caso de sucesso
 * @throws GoogleDriveApiError em caso de erro
 */
export async function fetchGoogleDriveApi<T>(
  url: string,
  options?: RequestInit,
  defaultErrorMessage = 'Erro na operação',
): Promise<T> {
  const response = await fetch(url, options)
  const result = await response.json()

  handleGoogleDriveApiResponse(response, result, defaultErrorMessage)

  return result.data
}
