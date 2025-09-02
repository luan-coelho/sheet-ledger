'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Therapy } from '@/app/db/schemas/therapy-schema'

import { Badge } from '@/components/ui/badge'
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
  therapy: Therapy
  onEdit: (therapy: Therapy) => void
  onDelete: (therapy: Therapy) => void
}

function ColumnActions({ therapy, onEdit, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(therapy)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(therapy)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(actions: {
  onEdit: (therapy: Therapy) => void
  onDelete: (therapy: Therapy) => void
}): ColumnDef<Therapy>[] {
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
        const therapy = row.original
        return <span className="font-medium">{therapy.name}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'active',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Status
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'select',
        filterOptions: {
          placeholder: 'Filtrar por status',
          allLabel: 'Todos os status',
          items: [
            { value: 'true', label: 'Ativa' },
            { value: 'false', label: 'Inativa' },
          ],
        },
      },
      cell: ({ row }) => {
        const isActive = row.getValue('active') as boolean
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Ativa' : 'Inativa'}</Badge>
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as boolean
        return cellValue.toString() === value
      },
    },
    ,
    /* {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Criado em
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'date',
        dateFilterConfig: {
          placeholder: 'Filtrar por data de criação',
        },
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(date))
      },
      filterFn: (row, id, value) => {
        if (!value) return true
        const rowDate = new Date(row.getValue(id) as Date)
        const filterDate = new Date(value)
        // Comparar apenas a data (ignorar o horário)
        return (
          rowDate.getFullYear() === filterDate.getFullYear() &&
          rowDate.getMonth() === filterDate.getMonth() &&
          rowDate.getDate() === filterDate.getDate()
        )
      },
    } */ {
      id: 'actions',
      cell: ({ row }) => {
        const therapy = row.original

        return <ColumnActions therapy={therapy} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      },
    },
  ]
}
