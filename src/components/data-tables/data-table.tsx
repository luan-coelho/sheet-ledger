'use client'

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'

/**
 * Componente DataTable genérico e reutilizável usando TanStack Table v8 com shadcn/ui
 *
 * Características implementadas:
 * - Filtros individuais por coluna nos headers
 * - Busca global em todos os campos
 * - Filtros específicos por tipo de dados (texto, status, data)
 * - Controle de visibilidade de colunas
 * - Ordenação por colunas
 * - Paginação sincronizada com URL (query params: page, size)
 * - Navegação direta para páginas específicas
 * - Seletor de itens por página
 * - Reset de filtros
 * - Tipagem completa em TypeScript
 * - Configurações customizáveis
 *
 * Paginação via URL:
 * - ?page=1&size=10 (página 1, 10 itens por página)
 * - ?page=2&size=20 (página 2, 20 itens por página)
 * - Suporta valores de 1-100 para size
 * - Navegação mantém estado na URL para compartilhamento
 *
 * Segue as práticas recomendadas do TanStack Table:
 * - Uso de hooks de estado controlado
 * - Filtros customizados por coluna
 * - Paginação controlada via URL
 * - Componentes reutilizáveis
 * - Performance otimizada com React.memo implícito
 */

export interface DataTableConfig {
  /** Habilitar/desabilitar busca global */
  enableGlobalFilter?: boolean
  /** Habilitar/desabilitar filtros por coluna */
  enableColumnFilters?: boolean
  /** Habilitar/desabilitar paginação via URL */
  enableUrlPagination?: boolean
  /** Tamanhos de página disponíveis */
  pageSizes?: number[]
  /** Tamanho inicial da página */
  initialPageSize?: number
  /** Máximo de páginas visíveis na navegação */
  maxVisiblePages?: number
  /** Texto customizado para "nenhum resultado" */
  noResultsText?: string
  /** Texto customizado para informações de paginação */
  paginationLabels?: {
    showing?: string
    of?: string
    results?: string
    itemsPerPage?: string
    previous?: string
    next?: string
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  config?: DataTableConfig
}

const defaultConfig: Required<DataTableConfig> = {
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableUrlPagination: true,
  pageSizes: [5, 10, 20, 50, 100],
  initialPageSize: 10,
  maxVisiblePages: 5,
  noResultsText: 'Nenhum resultado encontrado.',
  paginationLabels: {
    showing: 'Mostrando',
    of: 'de',
    results: 'resultados',
    itemsPerPage: 'Itens por página:',
    previous: 'Anterior',
    next: 'Próxima',
  },
}

// Componente de filtro individual para cada coluna
function ColumnFilter<TData>({
  column,
  config,
}: {
  column: Column<TData, unknown>
  config: Required<DataTableConfig>
}) {
  const columnFilterValue = column.getFilterValue()

  if (!config.enableColumnFilters || !column.getCanFilter()) {
    return null
  }

  // Filtro para campos de status (active)
  if (column.id === 'active') {
    return (
      <Select
        value={(columnFilterValue as string) ?? 'all'}
        onValueChange={value => column.setFilterValue(value === 'all' ? undefined : value)}>
        <SelectTrigger className="h-8 w-full border-dashed">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  // Não mostrar filtro para coluna de ações
  if (column.id === 'actions') {
    return null
  }

  // Filtro específico para campos de data
  if (column.id === 'createdAt' || column.id === 'updatedAt') {
    return (
      <div className="flex items-center space-x-1">
        <Input
          type="date"
          placeholder="Filtrar por data..."
          value={(columnFilterValue ?? '') as string}
          onChange={event => column.setFilterValue(event.target.value)}
          className="h-8 w-full border-dashed"
        />
        {columnFilterValue !== undefined && columnFilterValue !== '' && (
          <Button
            variant="ghost"
            onClick={() => column.setFilterValue(undefined)}
            className="hover:bg-muted h-8 w-8 p-0">
            <X className="h-3 w-3" />
            <span className="sr-only">Limpar filtro</span>
          </Button>
        )}
      </div>
    )
  }

  // Filtro de texto padrão
  const getPlaceholder = () => {
    switch (column.id) {
      case 'name':
        return 'Filtrar nome...'
      case 'email':
        return 'Filtrar e-mail...'
      case 'title':
        return 'Filtrar título...'
      case 'description':
        return 'Filtrar descrição...'
      default:
        return `Filtrar ${column.id}...`
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <Input
        placeholder={getPlaceholder()}
        value={(columnFilterValue ?? '') as string}
        onChange={event => column.setFilterValue(event.target.value)}
        className="h-8 w-full border-dashed"
      />
      {columnFilterValue !== undefined && columnFilterValue !== '' && (
        <Button variant="ghost" onClick={() => column.setFilterValue(undefined)} className="hover:bg-muted h-8 w-8 p-0">
          <X className="h-3 w-3" />
          <span className="sr-only">Limpar filtro</span>
        </Button>
      )}
    </div>
  )
}

export function DataTable<TData, TValue>({ columns, data, config: userConfig }: DataTableProps<TData, TValue>) {
  const config = { ...defaultConfig, ...userConfig }
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estado local para filtros e ordenação
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Estado de paginação sincronizado com URL (se habilitado)
  const [pagination, setPagination] = React.useState<PaginationState>(() => {
    if (!config.enableUrlPagination) {
      return {
        pageIndex: 0,
        pageSize: config.initialPageSize,
      }
    }

    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = parseInt(searchParams.get('size') || config.initialPageSize.toString(), 10)

    return {
      pageIndex: Math.max(0, page - 1), // Converter para índice baseado em 0
      pageSize: Math.max(1, Math.min(100, size)), // Limitar entre 1 e 100
    }
  })

  // Função para atualizar a URL quando a paginação mudar
  const updateURLPagination = React.useCallback(
    (newPagination: PaginationState) => {
      if (!config.enableUrlPagination) return

      const params = new URLSearchParams(searchParams.toString())
      params.set('page', (newPagination.pageIndex + 1).toString()) // Converter para página baseada em 1
      params.set('size', newPagination.pageSize.toString())

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, config.enableUrlPagination],
  )

  // Efeito para sincronizar mudanças na URL com o estado local
  React.useEffect(() => {
    if (!config.enableUrlPagination) return

    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = parseInt(searchParams.get('size') || config.initialPageSize.toString(), 10)

    const newPagination = {
      pageIndex: Math.max(0, page - 1),
      pageSize: Math.max(1, Math.min(100, size)),
    }

    // Só atualizar se houver diferença para evitar loops
    if (newPagination.pageIndex !== pagination.pageIndex || newPagination.pageSize !== pagination.pageSize) {
      setPagination(newPagination)
    }
  }, [searchParams, pagination.pageIndex, pagination.pageSize, config.enableUrlPagination, config.initialPageSize])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  })

  // Função para calcular páginas visíveis
  const getVisiblePages = React.useCallback((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    const totalPages = table.getPageCount()
    const currentPage = pagination.pageIndex + 1
    const maxVisiblePages = config.maxVisiblePages

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }, [pagination.pageIndex, table, config.maxVisiblePages])

  return (
    <div className="w-full space-y-4">
      {/* Tabela */}
      <div className="bg-background rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {/* Linha de headers */}
                <TableRow className="h-12">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
                {/* Linha de filtros */}
                {config.enableColumnFilters && (
                  <TableRow className="border-b">
                    {headerGroup.headers.map(header => (
                      <TableHead key={`${header.id}-filter`} className="p-2">
                        <ColumnFilter column={header.column} config={config} />
                      </TableHead>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell className="px-4" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {config.noResultsText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* Footer com Paginação */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length} className="px-6 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Informações e itens por página */}
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span>
                      {config.paginationLabels.showing} {pagination.pageIndex * pagination.pageSize + 1} a{' '}
                      {Math.min(
                        (pagination.pageIndex + 1) * pagination.pageSize,
                        table.getFilteredRowModel().rows.length,
                      )}{' '}
                      {config.paginationLabels.of} {table.getFilteredRowModel().rows.length}{' '}
                      {config.paginationLabels.results}
                    </span>

                    <div className="flex items-center gap-2">
                      <span>{config.paginationLabels.itemsPerPage}</span>
                      <Select
                        value={pagination.pageSize.toString()}
                        onValueChange={value => {
                          const newPagination = {
                            pageIndex: 0, // Resetar para primeira página
                            pageSize: parseInt(value, 10),
                          }
                          setPagination(newPagination)
                          updateURLPagination(newPagination)
                        }}>
                        <SelectTrigger className="bg-background w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.pageSizes.map(size => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Controles de navegação */}
                  <div className="flex items-center gap-2">
                    {/* Primeira página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPagination = { ...pagination, pageIndex: 0 }
                        setPagination(newPagination)
                        updateURLPagination(newPagination)
                      }}
                      disabled={!table.getCanPreviousPage()}
                      className="hidden sm:flex">
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    {/* Página anterior */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPagination = { ...pagination, pageIndex: pagination.pageIndex - 1 }
                        setPagination(newPagination)
                        updateURLPagination(newPagination)
                      }}
                      disabled={!table.getCanPreviousPage()}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">{config.paginationLabels.previous}</span>
                    </Button>

                    {/* Números das páginas */}
                    <div className="flex items-center gap-1">
                      {getVisiblePages().map((page, index) => (
                        <div key={index}>
                          {page === 'ellipsis' ? (
                            <div className="flex h-9 w-9 items-center justify-center">
                              <MoreHorizontal className="h-4 w-4" />
                            </div>
                          ) : (
                            <Button
                              variant={pagination.pageIndex + 1 === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newPagination = { ...pagination, pageIndex: (page as number) - 1 }
                                setPagination(newPagination)
                                updateURLPagination(newPagination)
                              }}
                              className="h-9 w-9">
                              {page}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Próxima página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPagination = { ...pagination, pageIndex: pagination.pageIndex + 1 }
                        setPagination(newPagination)
                        updateURLPagination(newPagination)
                      }}
                      disabled={!table.getCanNextPage()}>
                      <span className="hidden sm:inline">{config.paginationLabels.next}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Última página */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPagination = { ...pagination, pageIndex: table.getPageCount() - 1 }
                        setPagination(newPagination)
                        updateURLPagination(newPagination)
                      }}
                      disabled={!table.getCanNextPage()}
                      className="hidden sm:flex">
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
