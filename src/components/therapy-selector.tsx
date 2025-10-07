'use client'

import { FieldError } from 'react-hook-form'

import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useTherapies } from '@/hooks/use-therapies'

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

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar terapias</div>
  }

  // Filtrar apenas terapias ativas
  const activeTherapies = therapies?.filter(therapy => therapy.active) || []

  const options: ComboboxOption[] = activeTherapies.map(therapy => ({
    value: therapy.id,
    label: therapy.name,
  }))

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Buscar terapia..."
      emptyText="Nenhuma terapia encontrada."
      className={className}
      disabled={disabled}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
