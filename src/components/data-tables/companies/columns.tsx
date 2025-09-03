'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Company } from '@/app/db/schemas/company-schema'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function getSortIcon(sortDirection: false | 'asc' | 'desc') {
  if (sortDirection === 'asc') {
    return <ArrowUp className="ml-2 h-4 w-4" />
  }
  if (sortDirection === 'desc') {
    return <ArrowDown className="ml-2 h-4 w-4" />
  }
  return <ArrowUpDown className="ml-2 h-4 w-4" />
}

interface ColumnActionsProps {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

function ColumnActions({ company, onEdit, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(company)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(company)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(actions: {
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}): ColumnDef<Company>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Nome
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por nome...',
        },
      },
      cell: ({ row }) => {
        const company = row.original
        return <span className="font-medium">{company.name}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Endereço
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por endereço...',
        },
      },
      cell: ({ row }) => {
        const company = row.original
        return (
          <span className="block max-w-[300px] truncate" title={company.address}>
            {company.address}
          </span>
        )
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const company = row.original
        return <ColumnActions company={company} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      },
    },
  ]
}
