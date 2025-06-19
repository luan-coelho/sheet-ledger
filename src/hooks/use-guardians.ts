import { GuardianFormValues } from '@/app/db/schemas/guardian-schema'
import {
  createGuardian,
  deleteGuardian,
  getAllGuardians,
  getGuardianById,
  guardianQueryKeys,
  updateGuardian,
} from '@/services/guardian-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook para listar todos os responsáveis
export function useGuardians() {
  return useQuery({
    queryKey: guardianQueryKeys.lists(),
    queryFn: getAllGuardians,
  })
}

// Hook para buscar um responsável por ID
export function useGuardian(id: string) {
  return useQuery({
    queryKey: guardianQueryKeys.detail(id),
    queryFn: () => getGuardianById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo responsável
export function useCreateGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGuardian,
    onSuccess: () => {
      // Invalidar a lista de responsáveis para refetch
      queryClient.invalidateQueries({
        queryKey: guardianQueryKeys.lists(),
      })
      toast.success('Responsável criado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao criar responsável: ${error.message}`)
    },
  })
}

// Hook para atualizar um responsável
export function useUpdateGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GuardianFormValues }) => updateGuardian(id, data),
    onSuccess: updatedGuardian => {
      // Invalidar a lista de responsáveis
      queryClient.invalidateQueries({
        queryKey: guardianQueryKeys.lists(),
      })

      // Atualizar o cache do responsável específico
      queryClient.setQueryData(guardianQueryKeys.detail(updatedGuardian.id), updatedGuardian)
      toast.success('Responsável atualizado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao atualizar responsável: ${error.message}`)
    },
  })
}

// Hook para excluir um responsável
export function useDeleteGuardian() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGuardian,
    onSuccess: (_, deletedId) => {
      // Invalidar a lista de responsáveis
      queryClient.invalidateQueries({
        queryKey: guardianQueryKeys.lists(),
      })

      // Remover o responsável específico do cache
      queryClient.removeQueries({
        queryKey: guardianQueryKeys.detail(deletedId),
      })
      toast.success('Responsável excluído com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao excluir responsável: ${error.message}`)
    },
  })
}
