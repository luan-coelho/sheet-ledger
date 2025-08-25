'use client'

import { Check, X } from 'lucide-react'
import { FieldError } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'

import { useTherapies } from '@/hooks/use-therapies'

interface MultipleTherapySelectorProps {
  value?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: FieldError
}

export function MultipleTherapySelector({
  value = [],
  onValueChange,
  placeholder = 'Selecione as terapias...',
  className,
  disabled = false,
  error,
}: MultipleTherapySelectorProps) {
  const { data: therapies, isLoading, error: fetchError } = useTherapies()

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (fetchError) {
    return <div className="text-destructive text-sm">Erro ao carregar terapias</div>
  }

  // Filtrar apenas terapias ativas
  const activeTherapies = therapies?.filter(therapy => therapy.active) || []

  const handleToggleTherapy = (therapyId: string) => {
    if (value.includes(therapyId)) {
      onValueChange(value.filter(id => id !== therapyId))
    } else {
      onValueChange([...value, therapyId])
    }
  }

  const handleRemoveTherapy = (therapyId: string) => {
    onValueChange(value.filter(id => id !== therapyId))
  }

  const selectedTherapies = activeTherapies.filter(therapy => value.includes(therapy.id))

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={`w-full justify-between ${className}`}
            disabled={disabled}>
            {value.length > 0 ? `${value.length} terapia(s) selecionada(s)` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar terapias..." />
            <CommandEmpty>Nenhuma terapia encontrada.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {activeTherapies.map(therapy => (
                <CommandItem key={therapy.id} onSelect={() => handleToggleTherapy(therapy.id)}>
                  <Check className={`mr-2 h-4 w-4 ${value.includes(therapy.id) ? 'opacity-100' : 'opacity-0'}`} />
                  {therapy.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected therapies as badges */}
      {selectedTherapies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTherapies.map(therapy => (
            <Badge key={therapy.id} variant="secondary" className="text-xs">
              {therapy.name}
              <button
                type="button"
                className="hover:bg-destructive/20 ml-1 rounded-full p-0.5"
                onClick={() => handleRemoveTherapy(therapy.id)}
                disabled={disabled}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  )
}
