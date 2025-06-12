import { Guardian, GuardianFormValues } from '@/lib/schemas/guardian-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/responsaveis'

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
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

// Listar todos os responsáveis
export async function getAllGuardians(): Promise<Guardian[]> {
  const response = await apiRequest<Guardian[]>(API_BASE_URL)
  return response.data || []
}

// Buscar responsável por ID
export async function getGuardianById(id: string): Promise<Guardian> {
  const response = await apiRequest<Guardian>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Responsável não encontrado')
  }
  return response.data
}

// Criar novo responsável
export async function createGuardian(
  data: GuardianFormValues
): Promise<Guardian> {
  const response = await apiRequest<Guardian>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (!response.data) {
    throw new Error('Erro ao criar responsável')
  }
  
  return response.data
}

// Atualizar responsável
export async function updateGuardian(
  id: string,
  data: GuardianFormValues
): Promise<Guardian> {
  const response = await apiRequest<Guardian>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  
  if (!response.data) {
    throw new Error('Erro ao atualizar responsável')
  }
  
  return response.data
}

// Excluir responsável
export async function deleteGuardian(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const guardianQueryKeys = {
  all: ['guardians'] as const,
  lists: () => [...guardianQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...guardianQueryKeys.lists(), { filters }] as const,
  details: () => [...guardianQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...guardianQueryKeys.details(), id] as const,
}
