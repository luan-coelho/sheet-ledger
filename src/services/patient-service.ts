import { Patient, PatientFormValues, PatientWithProfessional } from '@/app/db/schemas/patient-schema'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
  details?: string
}

// Base URL da API
const API_BASE_URL = '/api/patients'

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

// Listar todos os pacientes
export async function getAllPatients(): Promise<PatientWithProfessional[]> {
  const response = await apiRequest<PatientWithProfessional[]>(API_BASE_URL)
  return response.data || []
}

// Buscar paciente por ID
export async function getPatientById(id: string): Promise<PatientWithProfessional> {
  const response = await apiRequest<PatientWithProfessional>(`${API_BASE_URL}/${id}`)
  if (!response.data) {
    throw new Error('Paciente não encontrado')
  }
  return response.data
}

// Criar novo paciente
export async function createPatient(data: PatientFormValues): Promise<Patient> {
  const response = await apiRequest<Patient>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao criar paciente')
  }

  return response.data
}

// Atualizar paciente
export async function updatePatient(id: string, data: PatientFormValues): Promise<Patient> {
  const response = await apiRequest<Patient>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.data) {
    throw new Error('Erro ao atualizar paciente')
  }

  return response.data
}

// Excluir paciente
export async function deletePatient(id: string): Promise<void> {
  await apiRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

// Hooks do React Query para gerenciamento de estado
export const patientQueryKeys = {
  all: ['patients'] as const,
  lists: () => [...patientQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...patientQueryKeys.lists(), { filters }] as const,
  details: () => [...patientQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientQueryKeys.details(), id] as const,
}
