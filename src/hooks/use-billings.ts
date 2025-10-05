import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BillingFormValues } from '@/app/db/schemas/billing-schema'

import {
  BillingFilters,
  billingQueryKeys,
  createBilling,
  deleteBilling,
  getAllBillings,
  getBillingById,
  updateBilling,
} from '@/services/billing-service'

// Hook para listar todos os faturamentos com filtros opcionais
export function useBillings(filters?: BillingFilters) {
  return useQuery({
    queryKey: billingQueryKeys.list(filters || {}),
    queryFn: () => getAllBillings(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar um faturamento por ID
export function useBilling(id: string) {
  return useQuery({
    queryKey: billingQueryKeys.detail(id),
    queryFn: () => getBillingById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para criar um novo faturamento
export function useCreateBilling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      toast.success('Faturamento criado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar faturamento: ${error.message}`)
    },
  })
}

// Hook para criar múltiplos faturamentos de uma vez
export function useCreateMultipleBillings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (billings: BillingFormValues[]) => {
      const results = await Promise.all(billings.map(billing => createBilling(billing)))
      return results
    },
    onSuccess: results => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      const count = results.length
      toast.success(`${count} faturamento${count > 1 ? 's' : ''} criado${count > 1 ? 's' : ''} com sucesso!`)
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar faturamentos: ${error.message}`)
    },
  })
}

// Hook para atualizar um faturamento
export function useUpdateBilling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BillingFormValues> }) => updateBilling(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.detail(variables.id) })
      toast.success('Faturamento atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar faturamento: ${error.message}`)
    },
  })
}

// Hook para excluir um faturamento
export function useDeleteBilling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.all })
      toast.success('Faturamento excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir faturamento: ${error.message}`)
    },
  })
}
