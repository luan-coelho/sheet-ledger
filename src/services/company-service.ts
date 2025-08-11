import { Company, CompanyFormValues } from '@/app/db/schemas/company-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/companies'

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

// Listar todas as empresas
export async function getAllCompanies(): Promise<Company[]> {
  const response = await apiRequest<Company[]>(API_BASE_URL)
  return response.data || []
}

// Buscar empresa por ID
export async function getCompanyById(id: string): Promise<Company> {
  const response = await apiRequest<Company>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Empresa não encontrada')
  }
  return response.data
}

// Criar nova empresa
export async function createCompany(data: CompanyFormValues): Promise<Company> {
  const response = await apiRequest<Company>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar empresa')
  }

  return response.data
}

// Atualizar empresa
export async function updateCompany(id: string, data: CompanyFormValues): Promise<Company> {
  const response = await apiRequest<Company>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar empresa')
  }

  return response.data
}

// Excluir empresa
export async function deleteCompany(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const companyQueryKeys = {
  all: ['companies'] as const,
  lists: () => [...companyQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...companyQueryKeys.lists(), { filters }] as const,
  details: () => [...companyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyQueryKeys.details(), id] as const,
}
