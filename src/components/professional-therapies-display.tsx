'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useProfessionalTherapies } from '@/hooks/use-professional-therapies'
import { useTherapies } from '@/hooks/use-therapies'

interface ProfessionalTherapiesDisplayProps {
  professionalId: string
}

export function ProfessionalTherapiesDisplay({ professionalId }: ProfessionalTherapiesDisplayProps) {
  const { data: therapyIds, isLoading: isLoadingTherapies } = useProfessionalTherapies(professionalId)
  const { data: allTherapies, isLoading: isLoadingAllTherapies } = useTherapies()

  if (isLoadingTherapies || isLoadingAllTherapies) {
    return <Skeleton className="h-6 w-24" />
  }

  if (!therapyIds || therapyIds.length === 0) {
    return <span className="text-muted-foreground text-sm">Nenhuma terapia</span>
  }

  // Filtrar as terapias que o profissional possui
  const professionalTherapies = allTherapies?.filter(therapy => therapyIds.includes(therapy.id)) || []

  if (professionalTherapies.length === 0) {
    return <span className="text-muted-foreground text-sm">Nenhuma terapia</span>
  }

  // Se há muitas terapias, mostrar apenas as primeiras e um contador
  if (professionalTherapies.length > 3) {
    const firstThree = professionalTherapies.slice(0, 3)
    const remaining = professionalTherapies.length - 3

    return (
      <div className="flex flex-wrap gap-1">
        {firstThree.map(therapy => (
          <Badge key={therapy.id} variant="secondary" className="text-xs">
            {therapy.name}
          </Badge>
        ))}
        <Badge variant="outline" className="text-xs">
          +{remaining} mais
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {professionalTherapies.map(therapy => (
        <Badge key={therapy.id} variant="secondary" className="text-xs">
          {therapy.name}
        </Badge>
      ))}
    </div>
  )
}
