'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { ProfessionalWithTherapy } from '@/app/db/schemas/professional-schema'

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
  professional: ProfessionalWithTherapy
  onEdit: (professional: ProfessionalWithTherapy) => void
  onDelete: (professional: ProfessionalWithTherapy) => void
}

function ColumnActions({ professional, onEdit, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(professional)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(professional)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(
  therapies: { id: string; name: string }[] | undefined,
  actions: {
    onEdit: (professional: ProfessionalWithTherapy) => void
    onDelete: (professional: ProfessionalWithTherapy) => void
  },
): ColumnDef<ProfessionalWithTherapy>[] {
  // Criar opções de filtro para terapias
  const therapyFilterOptions = [
    { value: 'null', label: 'Sem terapia' },
    ...(therapies?.map(therapy => ({ value: therapy.id, label: therapy.name })) || []),
  ]

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
        const professional = row.original
        return <span className="font-medium">{professional.name}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'councilNumber',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Nº Conselho
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por conselho...',
        },
      },
      cell: ({ row }) => {
        const councilNumber = row.getValue('councilNumber') as string | null
        return councilNumber || '-'
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (!cellValue) return false
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: 'therapyId',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Terapia
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'select',
        filterOptions: {
          placeholder: 'Filtrar por terapia',
          allLabel: 'Todas as terapias',
          items: therapyFilterOptions,
        },
      },
      cell: ({ row }) => {
        const professional = row.original
        return professional.therapy ? (
          <span className="text-sm">{professional.therapy.name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">Nenhuma terapia</span>
        )
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (value === 'null') {
          return cellValue === null
        }
        return cellValue === value
      },
    },
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
    } */ /* {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Atualizado em
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'date',
        dateFilterConfig: {
          placeholder: 'Filtrar por data de atualização',
        },
      },
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date
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
    } */
    {
      id: 'actions',
      cell: ({ row }) => {
        const professional = row.original

        return <ColumnActions professional={professional} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      },
    },
  ]
}
