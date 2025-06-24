import { HealthPlan, HealthPlanFormValues } from '@/app/db/schemas/health-plan-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/health-plans'

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

// Listar todos os planos de saúde
export async function getAllHealthPlans(): Promise<HealthPlan[]> {
  const response = await apiRequest<HealthPlan[]>(API_BASE_URL)
  return response.data || []
}

// Buscar plano de saúde por ID
export async function getHealthPlanById(id: string): Promise<HealthPlan> {
  const response = await apiRequest<HealthPlan>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Plano de saúde não encontrado')
  }
  return response.data
}

// Criar novo plano de saúde
export async function createHealthPlan(data: HealthPlanFormValues): Promise<HealthPlan> {
  const response = await apiRequest<HealthPlan>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar plano de saúde')
  }

  return response.data
}

// Atualizar plano de saúde
export async function updateHealthPlan(id: string, data: HealthPlanFormValues): Promise<HealthPlan> {
  const response = await apiRequest<HealthPlan>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar plano de saúde')
  }

  return response.data
}

// Excluir plano de saúde
export async function deleteHealthPlan(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const healthPlanQueryKeys = {
  all: ['healthPlans'] as const,
  lists: () => [...healthPlanQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...healthPlanQueryKeys.lists(), { filters }] as const,
  details: () => [...healthPlanQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthPlanQueryKeys.details(), id] as const,
}
