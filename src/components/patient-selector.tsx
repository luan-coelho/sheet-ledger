'use client'

import { FieldError } from 'react-hook-form'

import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { usePatients } from '@/hooks/use-patients'

interface PatientSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function PatientSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um paciente...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: PatientSelectorProps) {
  const { data: patients, isLoading, error: fetchError } = usePatients()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar pacientes</div>
  }

  const options: ComboboxOption[] =
    patients?.map(patient => ({
      value: patient.id,
      label: patient.name,
    })) || []

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Buscar paciente..."
      emptyText="Nenhum paciente encontrado."
      className={className}
      disabled={disabled}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
