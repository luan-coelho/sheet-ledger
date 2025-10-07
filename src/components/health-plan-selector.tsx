'use client'

import { FieldError } from 'react-hook-form'

import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useHealthPlans } from '@/hooks/use-health-plans'

interface HealthPlanSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function HealthPlanSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um plano de saúde...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: HealthPlanSelectorProps) {
  const { data: healthPlans, isLoading, error: fetchError } = useHealthPlans()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar planos de saúde</div>
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
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
