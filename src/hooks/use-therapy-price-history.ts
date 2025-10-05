import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  TherapyPriceHistoryFormValues,
  TherapyPriceHistoryWithFormatted,
  UpdateTherapyPriceHistoryFormValues,
} from '@/app/db/schemas/therapy-price-history-schema'

import {
  createTherapyPriceHistory,
  deleteTherapyPriceHistory,
  getTherapyPriceByCompetence,
  getTherapyPriceHistoryById,
  listTherapyPriceHistory,
  updateTherapyPriceHistory,
} from '@/services/therapy-price-history-service'

// Query keys
export const therapyPriceHistoryQueryKeys = {
  all: ['therapy-price-history'] as const,
  lists: () => [...therapyPriceHistoryQueryKeys.all, 'list'] as const,
  list: (therapyId: string, startCompetence?: string, endCompetence?: string) =>
    [...therapyPriceHistoryQueryKeys.lists(), { therapyId, startCompetence, endCompetence }] as const,
  details: () => [...therapyPriceHistoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...therapyPriceHistoryQueryKeys.details(), id] as const,
  byCompetence: (therapyId: string, competence: string) =>
    [...therapyPriceHistoryQueryKeys.all, 'by-competence', { therapyId, competence }] as const,
}

// Hook para listar histórico de preços de uma terapia
export function useTherapyPriceHistory(
  therapyId: string,
  startCompetence?: string,
  endCompetence?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: therapyPriceHistoryQueryKeys.list(therapyId, startCompetence, endCompetence),
    queryFn: () => listTherapyPriceHistory(therapyId, startCompetence, endCompetence),
    enabled: enabled && !!therapyId,
  })
}

// Hook para buscar um registro específico por ID
export function useTherapyPriceHistoryById(id: string, enabled = true) {
  return useQuery({
    queryKey: therapyPriceHistoryQueryKeys.detail(id),
    queryFn: () => getTherapyPriceHistoryById(id),
    enabled: enabled && !!id,
  })
}

// Hook para buscar valor de terapia por competência
export function useTherapyPriceByCompetence(therapyId: string, competence: string, enabled = true) {
  return useQuery({
    queryKey: therapyPriceHistoryQueryKeys.byCompetence(therapyId, competence),
    queryFn: () => getTherapyPriceByCompetence(therapyId, competence),
    enabled: enabled && !!therapyId && !!competence,
    retry: false, // Não retry se não encontrar valor
  })
}

// Hook para criar novo registro de histórico de preço
export function useCreateTherapyPriceHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TherapyPriceHistoryFormValues) => createTherapyPriceHistory(data),
    onSuccess: data => {
      // Invalida todas as queries relacionadas à terapia
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.list(data.therapyId),
      })
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.lists(),
      })
      toast.success('Valor da terapia cadastrado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar valor: ${error.message}`)
    },
  })
}

// Hook para atualizar registro de histórico de preço
export function useUpdateTherapyPriceHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTherapyPriceHistoryFormValues> }) =>
      updateTherapyPriceHistory(id, data),
    onSuccess: (data, variables) => {
      // Invalida o registro específico
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.detail(variables.id),
      })
      // Invalida todas as listas relacionadas à terapia
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.list(data.therapyId),
      })
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.lists(),
      })
      toast.success('Valor da terapia atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar valor: ${error.message}`)
    },
  })
}

// Hook para deletar registro de histórico de preço
export function useDeleteTherapyPriceHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTherapyPriceHistory(id),
    onSuccess: (_, id) => {
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: therapyPriceHistoryQueryKeys.detail(id),
      })
      toast.success('Valor da terapia removido com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover valor: ${error.message}`)
    },
  })
}

// Hook para obter o valor atual de uma terapia (último valor cadastrado)
export function useCurrentTherapyPrice(therapyId: string, enabled = true) {
  return useQuery({
    queryKey: therapyPriceHistoryQueryKeys.list(therapyId),
    queryFn: async () => {
      const history = await listTherapyPriceHistory(therapyId)
      // Retorna o primeiro item (mais recente) ou null
      return history.length > 0 ? history[0] : null
    },
    enabled: enabled && !!therapyId,
    select: data => data, // Pode ser null
  })
}

// Hook auxiliar para verificar se existe valor para uma competência
export function useHasTherapyPriceForCompetence(therapyId: string, competence: string, enabled = true) {
  const query = useTherapyPriceByCompetence(therapyId, competence, enabled)

  return {
    ...query,
    hasPrice: !query.isError && !!query.data,
    price: query.data?.value,
  }
}

// Hook para obter histórico agrupado por ano
export function useTherapyPriceHistoryByYear(therapyId: string, enabled = true) {
  return useQuery({
    queryKey: [...therapyPriceHistoryQueryKeys.list(therapyId), 'by-year'],
    queryFn: async () => {
      const history = await listTherapyPriceHistory(therapyId)

      // Agrupa por ano
      const byYear = history.reduce(
        (acc, item) => {
          const year = item.competence.split('-')[0]
          if (!acc[year]) {
            acc[year] = []
          }
          acc[year].push(item)
          return acc
        },
        {} as Record<string, TherapyPriceHistoryWithFormatted[]>,
      )

      // Converte para array e ordena por ano (mais recente primeiro)
      return Object.entries(byYear)
        .map(([year, items]) => ({
          year,
          items: items.sort((a, b) => b.competence.localeCompare(a.competence)),
        }))
        .sort((a, b) => b.year.localeCompare(a.year))
    },
    enabled: enabled && !!therapyId,
  })
}
