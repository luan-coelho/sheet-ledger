'use client'

import { usePatients } from '@/hooks/use-patients'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

interface PatientSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function PatientSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um paciente...',
  className,
  disabled = false,
}: PatientSelectorProps) {
  const { data: patients, isLoading, error } = usePatients()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar pacientes</div>
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
    />
  )
}
