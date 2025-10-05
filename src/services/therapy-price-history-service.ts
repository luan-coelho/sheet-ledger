import {
  TherapyPriceHistory,
  TherapyPriceHistoryFormValues,
  TherapyPriceHistoryWithFormatted,
  UpdateTherapyPriceHistoryFormValues,
} from '@/app/db/schemas/therapy-price-history-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  error?: string
  details?: unknown
  data?: T
}

// Base URL da API
const API_BASE_URL = '/api/therapy-price-history'

/**
 * Lista o histórico de preços de uma terapia
 * @param therapyId ID da terapia
 * @param startCompetence Competência inicial (opcional) no formato YYYY-MM
 * @param endCompetence Competência final (opcional) no formato YYYY-MM
 * @returns Lista de histórico de preços
 */
export async function listTherapyPriceHistory(
  therapyId: string,
  startCompetence?: string,
  endCompetence?: string,
): Promise<TherapyPriceHistoryWithFormatted[]> {
  const params = new URLSearchParams({ therapyId })

  if (startCompetence) {
    params.append('startCompetence', startCompetence)
  }

  if (endCompetence) {
    params.append('endCompetence', endCompetence)
  }

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao listar histórico de preços')
  }

  return response.json()
}

/**
 * Busca um registro de histórico de preço por ID
 * @param id ID do registro
 * @returns Registro de histórico de preço
 */
export async function getTherapyPriceHistoryById(id: string): Promise<TherapyPriceHistoryWithFormatted> {
  const response = await fetch(`${API_BASE_URL}/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao buscar histórico de preço')
  }

  return response.json()
}

/**
 * Busca o valor de uma terapia para uma competência específica
 * Se não houver valor exato, retorna o valor mais recente anterior
 * @param therapyId ID da terapia
 * @param competence Competência no formato YYYY-MM
 * @returns Registro de histórico de preço
 */
export async function getTherapyPriceByCompetence(
  therapyId: string,
  competence: string,
): Promise<TherapyPriceHistoryWithFormatted> {
  const params = new URLSearchParams({ therapyId, competence })
  const response = await fetch(`${API_BASE_URL}/by-competence?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao buscar valor da terapia')
  }

  return response.json()
}

/**
 * Cria um novo registro de histórico de preço
 * @param data Dados do histórico de preço
 * @returns Registro criado
 */
export async function createTherapyPriceHistory(
  data: TherapyPriceHistoryFormValues,
): Promise<TherapyPriceHistoryWithFormatted> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar histórico de preço')
  }

  return response.json()
}

/**
 * Atualiza um registro de histórico de preço
 * @param id ID do registro
 * @param data Dados a atualizar
 * @returns Registro atualizado
 */
export async function updateTherapyPriceHistory(
  id: string,
  data: Partial<UpdateTherapyPriceHistoryFormValues>,
): Promise<TherapyPriceHistoryWithFormatted> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar histórico de preço')
  }

  return response.json()
}

/**
 * Deleta um registro de histórico de preço
 * @param id ID do registro
 */
export async function deleteTherapyPriceHistory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar histórico de preço')
  }
}

/**
 * Helper para formatar competência no formato YYYY-MM
 * @param date Data ou string no formato YYYY-MM-DD
 * @returns String no formato YYYY-MM
 */
export function formatCompetence(date: Date | string): string {
  if (typeof date === 'string') {
    // Se já estiver no formato YYYY-MM, retorna direto
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
      return date
    }
    // Se estiver no formato YYYY-MM-DD, extrai YYYY-MM
    if (/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(date)) {
      return date.substring(0, 7)
    }
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Helper para formatar valor em reais
 * @param value Valor em reais
 * @returns String formatada (ex: "R$ 150,00")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Helper para converter competência em data (primeiro dia do mês)
 * @param competence Competência no formato YYYY-MM
 * @returns Data do primeiro dia do mês
 */
export function competenceToDate(competence: string): Date {
  const [year, month] = competence.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/**
 * Helper para validar formato de competência
 * @param competence String a validar
 * @returns true se válido
 */
export function isValidCompetence(competence: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competence)) {
    return false
  }

  const [year, month] = competence.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.getFullYear() === year && date.getMonth() === month - 1
}
