/**
 * Tipos para o componente DataTable genérico
 */

// Tipos para configuração de filtros por coluna
export interface ColumnFilterSelectOption {
  value: string
  label: string
}

export interface ColumnFilterSelectConfig {
  placeholder?: string
  allLabel?: string
  items: ColumnFilterSelectOption[]
}

export interface ColumnFilterDateConfig {
  placeholder?: string
}

export interface ColumnMeta {
  filterType?: 'select' | 'date' | 'text'
  filterOptions?: ColumnFilterSelectConfig
  dateFilterConfig?: ColumnFilterDateConfig
}

export interface DataTableConfig {
  /** Habilitar/desabilitar busca global */
  enableGlobalFilter?: boolean
  /** Habilitar/desabilitar filtros por coluna */
  enableColumnFilters?: boolean
  /** Habilitar/desabilitar paginação via URL */
  enableUrlPagination?: boolean
  /** Habilitar/desabilitar ordenação via URL */
  enableUrlSorting?: boolean
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
