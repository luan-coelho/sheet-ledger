import { Therapy, TherapyFormValues } from '@/app/db/schemas/therapy-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  error?: string
  details?: unknown
  data?: T
}

// Base URL da API
const API_BASE_URL = '/api/therapies'

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
      return { error: data.error || 'Erro na requisição', details: data.details }
    }

    return { data }
  } catch (error) {
    console.error('API request error:', error)
    return { error: 'Erro de conexão' }
  }
}

// Listar todas as terapias
export async function getAllTherapies(): Promise<Therapy[]> {
  const response = await apiRequest<Therapy[]>(API_BASE_URL)

  if (response.error) {
    throw new Error(response.error)
  }

  return response.data || []
}

// Buscar terapia por ID
export async function getTherapyById(id: string): Promise<Therapy> {
  const response = await apiRequest<Therapy>(`${API_BASE_URL}/${id}`)

  if (response.error) {
    throw new Error(response.error)
  }

  if (!response.data) {
    throw new Error('Terapia não encontrada')
  }

  return response.data
}

// Criar nova terapia
export async function createTherapy(data: TherapyFormValues): Promise<Therapy> {
  const response = await apiRequest<Therapy>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (response.error) {
    throw new Error(response.error)
  }

  if (!response.data) {
    throw new Error('Erro ao criar terapia')
  }

  return response.data
}

// Atualizar terapia
export async function updateTherapy(id: string, data: TherapyFormValues): Promise<Therapy> {
  const response = await apiRequest<Therapy>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (response.error) {
    throw new Error(response.error)
  }

  if (!response.data) {
    throw new Error('Erro ao atualizar terapia')
  }

  return response.data
}

// Excluir terapia
export async function deleteTherapy(id: string): Promise<void> {
  const response = await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })

  if (response.error) {
    throw new Error(response.error)
  }
}

// Hooks do React Query para gerenciamento de estado
export const therapyQueryKeys = {
  all: ['therapies'] as const,
  lists: () => [...therapyQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...therapyQueryKeys.lists(), { filters }] as const,
  details: () => [...therapyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...therapyQueryKeys.details(), id] as const,
}
