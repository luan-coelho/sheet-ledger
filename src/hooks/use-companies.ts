import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { CompanyFormValues } from '@/app/db/schemas/company-schema'

import {
  companyQueryKeys,
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} from '@/services/company-service'

// Hook para listar todas as empresas
export function useCompanies() {
  return useQuery({
    queryKey: companyQueryKeys.lists(),
    queryFn: getAllCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar uma empresa por ID
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyQueryKeys.detail(id),
    queryFn: () => getCompanyById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para criar uma nova empresa
export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all })
      toast.success('Empresa criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar empresa: ${error.message}`)
    },
  })
}

// Hook para atualizar uma empresa
export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyFormValues }) => updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail(variables.id) })
      toast.success('Empresa atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`)
    },
  })
}

// Hook para excluir uma empresa
export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all })
      toast.success('Empresa excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir empresa: ${error.message}`)
    },
  })
}
