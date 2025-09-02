'use client'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = 'max-w-sm',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
      <Input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="pr-10 pl-10" />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0">
          <X className="h-3 w-3" />
          <span className="sr-only">Limpar busca</span>
        </Button>
      )}
    </div>
  )
}
