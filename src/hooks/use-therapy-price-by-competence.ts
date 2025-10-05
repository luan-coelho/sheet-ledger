import { useQuery } from '@tanstack/react-query'

interface TherapyPriceByCompetence {
  id: string
  therapyId: string
  therapyName: string | null
  competence: string
  valueCents: number
  value: number
  createdAt: Date
  updatedAt: Date
}

interface UseTherapyPricesByCompetenceParams {
  therapyIds: string[]
  competence: string
  enabled?: boolean
}

// Hook para buscar valores de múltiplas terapias para uma competência específica
export function useTherapyPricesByCompetence({
  therapyIds,
  competence,
  enabled = true
}: UseTherapyPricesByCompetenceParams) {
  return useQuery({
    queryKey: ['therapy-prices-by-competence', therapyIds, competence],
    queryFn: async () => {
      if (!therapyIds.length || !competence) {
        return []
      }

      const results = await Promise.allSettled(
        therapyIds.map(async (therapyId) => {
          const response = await fetch(
            `/api/therapy-price-history/by-competence?therapyId=${therapyId}&competence=${competence}`
          )

          if (!response.ok) {
            if (response.status === 404) {
              // Se não encontrar valor para a terapia, retorna null
              return null
            }
            throw new Error(`Erro ao buscar valor da terapia: ${response.statusText}`)
          }

          return response.json() as Promise<TherapyPriceByCompetence>
        })
      )

      // Filtra apenas os resultados bem-sucedidos e não nulos
      return results
        .filter((result): result is PromiseFulfilledResult<TherapyPriceByCompetence> =>
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
    },
    enabled: enabled && therapyIds.length > 0 && !!competence,
  })
}

// Hook para buscar valor de uma única terapia por competência
export function useTherapyPriceByCompetence(therapyId: string, competence: string, enabled = true) {
  return useQuery({
    queryKey: ['therapy-price-by-competence', therapyId, competence],
    queryFn: async () => {
      if (!therapyId || !competence) {
        return null
      }

      const response = await fetch(
        `/api/therapy-price-history/by-competence?therapyId=${therapyId}&competence=${competence}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Erro ao buscar valor da terapia: ${response.statusText}`)
      }

      return response.json() as Promise<TherapyPriceByCompetence>
    },
    enabled: enabled && !!therapyId && !!competence,
  })
}
