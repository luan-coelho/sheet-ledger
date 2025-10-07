'use client'

import { FieldError } from 'react-hook-form'

import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCompanies } from '@/hooks/use-companies'

interface CompanySelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function CompanySelector({
  value,
  onValueChange,
  placeholder = 'Selecione uma empresa...',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: CompanySelectorProps) {
  const { data: companies, isLoading, error: fetchError } = useCompanies()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar empresas</div>
  }

  const options: ComboboxOption[] =
    companies?.map(company => ({
      value: company.id,
      label: company.name,
    })) || []

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Pesquisar empresas..."
      emptyText="Nenhuma empresa encontrada"
      className={className}
      disabled={disabled}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
