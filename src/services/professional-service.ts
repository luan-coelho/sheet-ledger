import { Professional, ProfessionalFormValues } from '@/app/db/schemas/professional-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/profissionais'

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
    console.error('Erro na requisição:', error)
    throw error
  }
}

// Listar todos os profissionais
export async function getAllProfessionals(): Promise<Professional[]> {
  const response = await apiRequest<Professional[]>(API_BASE_URL)
  return response.data || []
}

// Buscar profissional por ID
export async function getProfessionalById(id: string): Promise<Professional> {
  const response = await apiRequest<Professional>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Profissional não encontrado')
  }
  return response.data
}

// Criar novo profissional
export async function createProfessional(data: ProfessionalFormValues): Promise<Professional> {
  const response = await apiRequest<Professional>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar profissional')
  }

  return response.data
}

// Atualizar profissional
export async function updateProfessional(id: string, data: ProfessionalFormValues): Promise<Professional> {
  const response = await apiRequest<Professional>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar profissional')
  }

  return response.data
}

// Excluir profissional
export async function deleteProfessional(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const professionalQueryKeys = {
  all: ['professionals'] as const,
  lists: () => [...professionalQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...professionalQueryKeys.lists(), { filters }] as const,
  details: () => [...professionalQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...professionalQueryKeys.details(), id] as const,
}
