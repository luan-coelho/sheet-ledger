import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  addTherapyToProfessional,
  getTherapiesByProfessional,
  professionalTherapyQueryKeys,
  removeTherapyFromProfessional,
  updateProfessionalTherapies,
} from '@/services/professional-therapy-service'

// Hook para listar terapias de um profissional
export function useProfessionalTherapies(professionalId: string) {
  return useQuery({
    queryKey: professionalTherapyQueryKeys.byProfessional(professionalId),
    queryFn: () => getTherapiesByProfessional(professionalId),
    enabled: !!professionalId,
  })
}

// Hook para adicionar terapia ao profissional
export function useAddTherapyToProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTherapyToProfessional,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalTherapyQueryKeys.byProfessional(variables.professionalId),
      })
      toast.success('Terapia associada ao profissional com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao associar terapia: ${error.message}`)
    },
  })
}

// Hook para remover terapia do profissional
export function useRemoveTherapyFromProfessional() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ professionalId, therapyId }: { professionalId: string; therapyId: string }) =>
      removeTherapyFromProfessional(professionalId, therapyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalTherapyQueryKeys.byProfessional(variables.professionalId),
      })
      toast.success('Terapia removida do profissional com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover terapia: ${error.message}`)
    },
  })
}

// Hook para atualizar todas as terapias do profissional
export function useUpdateProfessionalTherapies() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ professionalId, therapyIds }: { professionalId: string; therapyIds: string[] }) =>
      updateProfessionalTherapies(professionalId, therapyIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalTherapyQueryKeys.byProfessional(variables.professionalId),
      })
      toast.success('Terapias do profissional atualizadas com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar terapias: ${error.message}`)
    },
  })
}
