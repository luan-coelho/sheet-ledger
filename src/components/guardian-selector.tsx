'use client'

import { useGuardians } from '@/hooks/use-guardians'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
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

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar responsáveis</div>
  }

  const options: ComboboxOption[] =
    guardians?.map(guardian => ({
      value: guardian.id,
      label: guardian.name,
    })) || []

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Buscar responsável..."
      emptyText="Nenhum responsável encontrado."
      className={className}
      disabled={disabled}
    />
  )
}
