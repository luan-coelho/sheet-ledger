import { ProfessionalFormValues } from '@/app/db/schemas/professional-schema'
import {
  createProfessional,
  deleteProfessional,
  getAllProfessionals,
  getProfessionalById,
  professionalQueryKeys,
  updateProfessional,
} from '@/services/professional-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook para listar todos os profissionais
export function useProfessionals() {
  return useQuery({
    queryKey: professionalQueryKeys.lists(),
    queryFn: getAllProfessionals,
  })
}

// Hook para buscar um profissional por ID
export function useProfessional(id: string) {
  return useQuery({
    queryKey: professionalQueryKeys.detail(id),
    queryFn: () => getProfessionalById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo profissional
export function useCreateProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProfessional,
    onSuccess: () => {
      // Invalidar a lista de profissionais para refetch
      queryClient.invalidateQueries({
        queryKey: professionalQueryKeys.lists(),
      })
      toast.success('Profissional criado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao criar profissional: ${error.message}`)
    },
  })
}

// Hook para atualizar um profissional
export function useUpdateProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfessionalFormValues }) => updateProfessional(id, data),
    onSuccess: updatedProfessional => {
      // Invalidar a lista de profissionais
      queryClient.invalidateQueries({
        queryKey: professionalQueryKeys.lists(),
      })

      // Atualizar o cache do profissional específico
      queryClient.setQueryData(professionalQueryKeys.detail(updatedProfessional.id), updatedProfessional)
      toast.success('Profissional atualizado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao atualizar profissional: ${error.message}`)
    },
  })
}

// Hook para excluir um profissional
export function useDeleteProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProfessional,
    onSuccess: (_, deletedId) => {
      // Invalidar a lista de profissionais
      queryClient.invalidateQueries({
        queryKey: professionalQueryKeys.lists(),
      })

      // Remover o profissional específico do cache
      queryClient.removeQueries({
        queryKey: professionalQueryKeys.detail(deletedId),
      })
      toast.success('Profissional excluído com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao excluir profissional: ${error.message}`)
    },
  })
}
