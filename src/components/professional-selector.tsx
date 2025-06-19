'use client'

import { useProfessionals } from '@/hooks/use-professionals'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

interface ProfessionalSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ProfessionalSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um profissional...',
  className,
  disabled = false,
}: ProfessionalSelectorProps) {
  const { data: professionals, isLoading, error } = useProfessionals()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar profissionais</div>
  }

  const options: ComboboxOption[] =
    professionals?.map(professional => ({
      value: professional.id,
      label: professional.name,
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
    />
  )
}
