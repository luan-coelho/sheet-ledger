'use client'

import { FieldError } from 'react-hook-form'

import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCreateHealthPlan, useHealthPlans } from '@/hooks/use-health-plans'

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
  const createHealthPlan = useCreateHealthPlan()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar planos de saúde</div>
  }

  const options: CreatableComboboxOption[] =
    healthPlans?.map(healthPlan => ({
      value: healthPlan.id,
      label: healthPlan.name,
    })) || []

  const handleCreate = async (name: string) => {
    const result = await createHealthPlan.mutateAsync({ name })
    return result.id
  }

  // Validação baseada no schema: nome deve ter pelo menos 3 caracteres
  const validateName = (name: string) => {
    return name.trim().length >= 3
  }

  return (
    <CreatableCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onCreate={handleCreate}
      validate={validateName}
      placeholder={placeholder}
      searchPlaceholder="Buscar plano de saúde..."
      emptyText="Nenhum plano de saúde encontrado."
      createText="Criar plano de saúde"
      className={className}
      disabled={disabled}
      isCreating={createHealthPlan.isPending}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
