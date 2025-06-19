'use client'

import { useHealthPlans } from '@/hooks/use-health-plans'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

interface HealthPlanSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function HealthPlanSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um plano de saúde...',
  className,
  disabled = false,
}: HealthPlanSelectorProps) {
  const { data: healthPlans, isLoading, error } = useHealthPlans()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar planos de saúde</div>
  }

  const options: ComboboxOption[] =
    healthPlans?.map(healthPlan => ({
      value: healthPlan.id,
      label: healthPlan.name,
    })) || []

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Buscar plano de saúde..."
      emptyText="Nenhum plano de saúde encontrado."
      className={className}
      disabled={disabled}
    />
  )
}
