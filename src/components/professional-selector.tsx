'use client'

import { FieldError } from 'react-hook-form'

import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useProfessionals } from '@/hooks/use-professionals'

interface ProfessionalSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function ProfessionalSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um profissional...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: ProfessionalSelectorProps) {
  const { data: professionals, isLoading, error: fetchError } = useProfessionals()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar profissionais</div>
  }

  const options: ComboboxOption[] =
    professionals?.map(professional => ({
      value: professional.id,
      label: professional.therapy ? `${professional.name} - ${professional.therapy.name}` : professional.name,
    })) || []

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Buscar profissional..."
      emptyText="Nenhum profissional encontrado."
      className={className}
      disabled={disabled}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
