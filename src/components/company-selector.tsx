'use client'

import { FieldError } from 'react-hook-form'

import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
import { Skeleton } from '@/components/ui/skeleton'

import { useCompanies, useCreateCompany } from '@/hooks/use-companies'

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
  const createCompany = useCreateCompany()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar empresas</div>
  }

  const options: CreatableComboboxOption[] =
    companies?.map(company => ({
      value: company.id,
      label: company.name,
    })) || []

  const handleCreate = async (name: string) => {
    const result = await createCompany.mutateAsync({
      name,
      address: 'Endereço não informado', // Valor padrão temporário
    })
    return result.id
  }

  // Validação baseada no schema: nome deve ter pelo menos 3 caracteres
  const validateInput = (input: string) => {
    return input.length >= 3
  }

  return (
    <CreatableCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onCreate={handleCreate}
      validate={validateInput}
      placeholder={placeholder}
      searchPlaceholder="Pesquisar empresas..."
      emptyText="Nenhuma empresa encontrada"
      createText="Criar empresa"
      className={className}
      disabled={disabled}
      showValidationIcon={showValidationIcon}
      error={error}
    />
  )
}
