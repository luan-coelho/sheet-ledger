'use client'

import { useProfessionals, useCreateProfessional } from '@/hooks/use-professionals'
import { CreatableCombobox, CreatableComboboxOption } from '@/components/ui/creatable-combobox'
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
  const createProfessional = useCreateProfessional()

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />
  }

  if (error) {
    return <div className="text-sm text-destructive">Erro ao carregar profissionais</div>
  }

  const options: CreatableComboboxOption[] =
    professionals?.map(professional => ({
      value: professional.id,
      label: professional.name,
    })) || []

  const handleCreate = async (name: string) => {
    const result = await createProfessional.mutateAsync({ name })
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
      searchPlaceholder="Buscar profissional..."
      emptyText="Nenhum profissional encontrado."
      createText="Criar profissional"
      className={className}
      disabled={disabled}
      isCreating={createProfessional.isPending}
    />
  )
}
