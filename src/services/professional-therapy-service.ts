import { z } from 'zod'

// Schemas para validação no cliente
export const insertProfessionalTherapySchema = z.object({
  professionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  therapyId: z.string().min(1, 'ID da terapia é obrigatório'),
})

export type NewProfessionalTherapy = z.infer<typeof insertProfessionalTherapySchema>

// Query keys for React Query
export const professionalTherapyQueryKeys = {
  all: ['professional-therapies'] as const,
  lists: () => [...professionalTherapyQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...professionalTherapyQueryKeys.lists(), { filters }] as const,
  details: () => [...professionalTherapyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...professionalTherapyQueryKeys.details(), id] as const,
  byProfessional: (professionalId: string) =>
    [...professionalTherapyQueryKeys.all, 'by-professional', professionalId] as const,
}

// Tipos para as respostas da API
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
}

// Base URL da API
const API_BASE_URL = '/api/professionals'

// Função auxiliar para fazer requisições
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição')
    }

    return data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro desconhecido')
  }
}

// Função para obter os IDs das terapias de um profissional
export async function getTherapiesByProfessional(professionalId: string): Promise<string[]> {
  if (!professionalId.trim()) {
    throw new Error('ID do profissional é obrigatório')
  }

  const response = await apiRequest<string[]>(`${API_BASE_URL}/${professionalId}/therapies`)

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Erro ao buscar terapias do profissional')
  }

  return response.data
}

// Função para adicionar uma terapia a um profissional
export async function addTherapyToProfessional(data: NewProfessionalTherapy): Promise<NewProfessionalTherapy> {
  const validatedData = insertProfessionalTherapySchema.parse(data)

  const response = await apiRequest<NewProfessionalTherapy>(
    `${API_BASE_URL}/${validatedData.professionalId}/therapies`,
    {
      method: 'POST',
      body: JSON.stringify({ therapyId: validatedData.therapyId }),
    },
  )

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Erro ao adicionar terapia ao profissional')
  }

  return response.data
}

// Função para remover uma terapia de um profissional
export async function removeTherapyFromProfessional(
  professionalId: string,
  therapyId: string,
): Promise<{ message: string }> {
  if (!professionalId.trim()) {
    throw new Error('ID do profissional é obrigatório')
  }

  if (!therapyId.trim()) {
    throw new Error('ID da terapia é obrigatório')
  }

  const response = await apiRequest<{ message: string }>(
    `${API_BASE_URL}/${professionalId}/therapies?therapyId=${encodeURIComponent(therapyId)}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.success) {
    throw new Error(response.message || 'Erro ao remover terapia do profissional')
  }

  return { message: response.message }
}

// Função para atualizar todas as terapias de um profissional
export async function updateProfessionalTherapies(
  professionalId: string,
  therapyIds: string[],
): Promise<{ message: string }> {
  if (!professionalId.trim()) {
    throw new Error('ID do profissional é obrigatório')
  }

  const response = await apiRequest<{ message: string }>(`${API_BASE_URL}/${professionalId}/therapies`, {
    method: 'PUT',
    body: JSON.stringify({ therapyIds }),
  })

  if (!response.success) {
    throw new Error(response.message || 'Erro ao atualizar terapias do profissional')
  }

  return { message: response.message }
}
