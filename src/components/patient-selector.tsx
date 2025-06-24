'use client'

import { usePatients, useCreatePatient } from '@/hooks/use-patients'
import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
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
  const createPatient = useCreatePatient()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar pacientes</div>
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

  return (
    <CreatableCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onCreate={handleCreate}
      placeholder={placeholder}
      searchPlaceholder="Buscar paciente..."
      emptyText="Nenhum paciente encontrado."
      createText="Criar paciente"
      className={className}
      disabled={disabled}
      isCreating={createPatient.isPending}
    />
  )
}
