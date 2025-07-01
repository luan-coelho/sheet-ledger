'use client'

import { FieldError } from 'react-hook-form'

import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCreatePatient, usePatients } from '@/hooks/use-patients'

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
  const createPatient = useCreatePatient()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar pacientes</div>
  }

  const options: CreatableComboboxOption[] =
    patients?.map(patient => ({
      value: patient.id,
      label: patient.name,
    })) || []

  const handleCreate = async (name: string) => {
    const result = await createPatient.mutateAsync({ name })
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
      searchPlaceholder="Buscar paciente..."
      emptyText="Nenhum paciente encontrado."
      createText="Criar paciente"
      className={className}
      disabled={disabled}
      isCreating={createPatient.isPending}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
