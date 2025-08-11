'use client'

import { FieldError } from 'react-hook-form'

import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCreateTherapy, useTherapies } from '@/hooks/use-therapies'

interface TherapySelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function TherapySelector({
  value,
  onValueChange,
  placeholder = 'Selecione uma terapia...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: TherapySelectorProps) {
  const { data: therapies, isLoading, error: fetchError } = useTherapies()
  const createTherapy = useCreateTherapy()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar terapias</div>
  }

  // Filtrar apenas terapias ativas
  const activeTherapies = therapies?.filter(therapy => therapy.active) || []

  const options: CreatableComboboxOption[] = activeTherapies.map(therapy => ({
    value: therapy.id,
    label: therapy.name,
  }))

  const handleCreate = async (name: string) => {
    const result = await createTherapy.mutateAsync({ name, active: true })
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
      searchPlaceholder="Buscar terapia..."
      emptyText="Nenhuma terapia encontrada."
      createText="Criar terapia"
      className={className}
      disabled={disabled}
      isCreating={createTherapy.isPending}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
