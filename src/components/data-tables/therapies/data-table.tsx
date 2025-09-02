'use client'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableConfig, DataTable as GenericDataTable } from '@/components/data-tables'

/**
 * DataTable específico para terapias
 * Utiliza o componente genérico DataTable com configurações específicas para a tabela de terapias
 */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const therapiesTableConfig: DataTableConfig = {
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableUrlPagination: true,
  enableUrlSorting: true,
  pageSizes: [5, 10, 20, 50, 100],
  initialPageSize: 10,
  maxVisiblePages: 5,
  noResultsText: 'Nenhuma terapia encontrada.',
  paginationLabels: {
    showing: 'Mostrando',
    of: 'de',
    results: 'terapias',
    itemsPerPage: 'Terapias por página:',
    previous: 'Anterior',
    next: 'Próxima',
  },
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  return <GenericDataTable columns={columns} data={data} config={therapiesTableConfig} />
}
