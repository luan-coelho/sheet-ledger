'use client'

import { useGuardians, useCreateGuardian } from '@/hooks/use-guardians'
import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

interface GuardianSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function GuardianSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um responsável...',
  className,
  disabled = false,
}: GuardianSelectorProps) {
  const { data: guardians, isLoading, error } = useGuardians()
  const createGuardian = useCreateGuardian()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar responsáveis</div>
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

  return (
    <CreatableCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onCreate={handleCreate}
      placeholder={placeholder}
      searchPlaceholder="Buscar responsável..."
      emptyText="Nenhum responsável encontrado."
      createText="Criar responsável"
      className={className}
      disabled={disabled}
      isCreating={createGuardian.isPending}
    />
  )
}
