import { BillingFormValues } from '@/app/db/schemas/billing-schema'

export interface BillingWithRelations {
  id: string
  patientId: string
  patientName: string | null
  therapyId: string | null
  therapyName: string | null
  customTherapyName: string | null
  healthPlanId: string | null
  healthPlanName: string | null
  billingCycle: string | null
  sessionValueCents: number
  grossAmountCents: number
  netAmountCents: number | null
  dueDate: string | null
  invoiceIssuedAt: string | null
  invoiceNumber: string | null
  competenceDate: string | null
  billerName: string | null
  status: 'pending' | 'scheduled' | 'sent' | 'paid' | 'cancelled'
  isBilled: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BillingSummary {
  totalGrossCents: number
  totalNetCents: number
  pendingCount: number
  paidCount: number
}

export interface BillingFilters {
  status?: string
  patientId?: string
  dueDateFrom?: string
  dueDateTo?: string
}

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  summary?: BillingSummary
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/billings'

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

// Listar todos os faturamentos com filtros opcionais
export async function getAllBillings(filters?: BillingFilters): Promise<{
  billings: BillingWithRelations[]
  summary: BillingSummary
}> {
  const params = new URLSearchParams()

  if (filters?.status) params.append('status', filters.status)
  if (filters?.patientId) params.append('patientId', filters.patientId)
  if (filters?.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom)
  if (filters?.dueDateTo) params.append('dueDateTo', filters.dueDateTo)

  const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL

  const response = await apiRequest<BillingWithRelations[]>(url)

  return {
    billings: response.data || [],
    summary: response.summary || {
      totalGrossCents: 0,
      totalNetCents: 0,
      pendingCount: 0,
      paidCount: 0,
    },
  }
}

// Buscar faturamento por ID
export async function getBillingById(id: string): Promise<BillingWithRelations> {
  const response = await apiRequest<BillingWithRelations>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Faturamento não encontrado')
  }
  return response.data
}

// Criar novo faturamento
export async function createBilling(data: BillingFormValues): Promise<BillingWithRelations> {
  const response = await apiRequest<BillingWithRelations>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar faturamento')
  }

  return response.data
}

// Atualizar faturamento
export async function updateBilling(id: string, data: Partial<BillingFormValues>): Promise<BillingWithRelations> {
  const response = await apiRequest<BillingWithRelations>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar faturamento')
  }

  return response.data
}

// Excluir faturamento
export async function deleteBilling(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const billingQueryKeys = {
  all: ['billings'] as const,
  lists: () => [...billingQueryKeys.all, 'list'] as const,
  list: (filters: BillingFilters) => [...billingQueryKeys.lists(), { filters }] as const,
  details: () => [...billingQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...billingQueryKeys.details(), id] as const,
}
