import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { TherapyFormValues } from '@/app/db/schemas/therapy-schema'

import {
  createTherapy,
  deleteTherapy,
  getAllTherapies,
  getTherapyById,
  therapyQueryKeys,
  updateTherapy,
} from '@/services/therapy-service'

// Hook para listar todas as terapias
export function useTherapies() {
  return useQuery({
    queryKey: therapyQueryKeys.lists(),
    queryFn: getAllTherapies,
  })
}

// Hook para buscar uma terapia por ID
export function useTherapy(id: string) {
  return useQuery({
    queryKey: therapyQueryKeys.detail(id),
    queryFn: () => getTherapyById(id),
    enabled: !!id,
  })
}

// Hook para criar uma nova terapia
export function useCreateTherapy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: therapyQueryKeys.lists() })
      toast.success('Terapia criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar terapia: ${error.message}`)
    },
  })
}

// Hook para atualizar uma terapia
export function useUpdateTherapy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TherapyFormValues }) => updateTherapy(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: therapyQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: therapyQueryKeys.detail(id) })
      toast.success('Terapia atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar terapia: ${error.message}`)
    },
  })
}

// Hook para excluir uma terapia
export function useDeleteTherapy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: therapyQueryKeys.lists() })
      toast.success('Terapia excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir terapia: ${error.message}`)
    },
  })
}
