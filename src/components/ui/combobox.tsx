'use client'

import { AlertCircle, Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { FieldError } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  showValidationIcon?: boolean
  error?: FieldError
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhuma opção encontrada.',
  className,
  disabled = false,
  showValidationIcon = false,
  error,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedOption = options.find(option => option.value === value)
  const hasError = error !== undefined && error !== null
  const showErrorIcon = showValidationIcon && hasError

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue === value ? '' : currentValue)
    setOpen(false)
  }

  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-10 w-full justify-between overflow-hidden rounded-sm text-left',
              !selectedOption && 'text-muted-foreground',
              hasError ? 'border-destructive' : 'border-zinc-300',
              showErrorIcon ? 'pr-10' : 'pr-8',
              className,
            )}
            disabled={disabled}
            style={{ minWidth: 0 }}>
            <span
              className="block truncate overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ maxWidth: showErrorIcon ? 'calc(100% - 3.5rem)' : 'calc(100% - 2rem)' }}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {!showErrorIcon && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                    <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredOptions.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showErrorIcon && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <AlertCircle className="text-destructive size-4" />
        </div>
      )}
    </div>
  )
}
