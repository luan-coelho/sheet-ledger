'use client'

import { FieldError } from 'react-hook-form'

import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCreateGuardian, useGuardians } from '@/hooks/use-guardians'

interface GuardianSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function GuardianSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um responsável...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: GuardianSelectorProps) {
  const { data: guardians, isLoading, error: fetchError } = useGuardians()
  const createGuardian = useCreateGuardian()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar responsáveis</div>
  }

  const options: CreatableComboboxOption[] =
    guardians?.map(guardian => ({
      value: guardian.id,
      label: guardian.name,
    })) || []

  const handleCreate = async (name: string) => {
    const result = await createGuardian.mutateAsync({ name })
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
      searchPlaceholder="Buscar responsável..."
      emptyText="Nenhum responsável encontrado."
      createText="Criar responsável"
      className={className}
      disabled={disabled}
      isCreating={createGuardian.isPending}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
