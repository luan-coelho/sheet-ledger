import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAllHealthPlans,
  getHealthPlanById,
  createHealthPlan,
  updateHealthPlan,
  deleteHealthPlan,
  healthPlanQueryKeys,
} from '@/services/health-plan-service'
import { HealthPlan, HealthPlanFormValues } from '@/lib/schemas/health-plan-schema'

// Hook para listar todos os planos de saúde
export function useHealthPlans() {
  return useQuery({
    queryKey: healthPlanQueryKeys.lists(),
    queryFn: getAllHealthPlans,
  })
}

// Hook para buscar um plano de saúde por ID
export function useHealthPlan(id: string) {
  return useQuery({
    queryKey: healthPlanQueryKeys.detail(id),
    queryFn: () => getHealthPlanById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo plano de saúde
export function useCreateHealthPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHealthPlan,
    onSuccess: () => {
      // Invalidar a lista de planos de saúde para refetch
      queryClient.invalidateQueries({
        queryKey: healthPlanQueryKeys.lists(),
      })
      toast.success('Plano de saúde criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar plano de saúde: ${error.message}`)
    },
  })
}

// Hook para atualizar um plano de saúde
export function useUpdateHealthPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HealthPlanFormValues }) =>
      updateHealthPlan(id, data),
    onSuccess: (updatedHealthPlan) => {
      // Invalidar a lista de planos de saúde
      queryClient.invalidateQueries({
        queryKey: healthPlanQueryKeys.lists(),
      })
      
      // Atualizar o cache do plano de saúde específico
      queryClient.setQueryData(
        healthPlanQueryKeys.detail(updatedHealthPlan.id),
        updatedHealthPlan
      )
      toast.success('Plano de saúde atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar plano de saúde: ${error.message}`)
    },
  })
}

// Hook para excluir um plano de saúde
export function useDeleteHealthPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHealthPlan,
    onSuccess: (_, deletedId) => {
      // Invalidar a lista de planos de saúde
      queryClient.invalidateQueries({
        queryKey: healthPlanQueryKeys.lists(),
      })
      
      // Remover o plano de saúde específico do cache
      queryClient.removeQueries({
        queryKey: healthPlanQueryKeys.detail(deletedId),
      })
      toast.success('Plano de saúde excluído com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao excluir plano de saúde: ${error.message}`)
    },
  })
}
