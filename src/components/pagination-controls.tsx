'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  visiblePages: (number | 'ellipsis')[]
  onPageChange: (page: number) => void
  onFirstPage: () => void
  onLastPage: () => void
  onNextPage: () => void
  onPreviousPage: () => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
  onItemsPerPageChange?: (itemsPerPage: number) => void
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  hasNextPage,
  hasPreviousPage,
  visiblePages,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
  showItemsPerPage = false,
  itemsPerPageOptions = [10, 20, 50, 100],
  onItemsPerPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Informações e itens por página */}
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <span>
          Mostrando {startIndex + 1} a {endIndex} de {totalItems} resultados
        </span>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <Select value={itemsPerPage.toString()} onValueChange={value => onItemsPerPageChange(parseInt(value, 10))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <Button
          variant="outline"
          size="sm"
          onClick={onFirstPage}
          disabled={!hasPreviousPage}
          className="hidden sm:flex">
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Página anterior */}
        <Button variant="outline" size="sm" onClick={onPreviousPage} disabled={!hasPreviousPage}>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === 'ellipsis' ? (
                <div className="flex h-9 w-9 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-9 w-9">
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Próxima página */}
        <Button variant="outline" size="sm" onClick={onNextPage} disabled={!hasNextPage}>
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Última página */}
        <Button variant="outline" size="sm" onClick={onLastPage} disabled={!hasNextPage} className="hidden sm:flex">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
