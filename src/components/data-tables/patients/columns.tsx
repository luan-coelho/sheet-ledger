'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Patient } from '@/app/db/schemas/patient-schema'

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
  patient: Patient
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

function ColumnActions({ patient, onEdit, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(patient)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(patient)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(
  healthPlans: { id: string; name: string }[] | undefined,
  actions: {
    onEdit: (patient: Patient) => void
    onDelete: (patient: Patient) => void
  },
): ColumnDef<Patient>[] {
  const getHealthPlanName = (healthPlanId: string | null) => {
    if (!healthPlanId) return '-'
    const healthPlan = healthPlans?.find(plan => plan.id === healthPlanId)
    return healthPlan?.name || 'Plano não encontrado'
  }

  // Criar opções de filtro para planos de saúde
  const healthPlanFilterOptions = [
    { value: 'null', label: 'Sem plano' },
    ...(healthPlans?.map(plan => ({ value: plan.id, label: plan.name })) || []),
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
        const patient = row.original
        return <span className="font-medium">{patient.name}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'guardian',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Responsável
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por responsável...',
        },
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'healthPlanId',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Plano de Saúde
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'select',
        filterOptions: {
          placeholder: 'Filtrar por plano',
          allLabel: 'Todos os planos',
          items: healthPlanFilterOptions,
        },
      },
      cell: ({ row }) => {
        const healthPlanId = row.getValue('healthPlanId') as string | null
        return getHealthPlanName(healthPlanId)
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (value === 'null') {
          return cellValue === null
        }
        return cellValue === value
      },
    },
    {
      accessorKey: 'cardNumber',
      header: 'N° Carteirinha',
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por carteirinha...',
        },
      },
      cell: ({ row }) => {
        const cardNumber = row.getValue('cardNumber') as string | null
        return cardNumber || '-'
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (!cellValue) return false
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: 'guideNumber',
      header: 'N° Guia',
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por guia...',
        },
      },
      cell: ({ row }) => {
        const guideNumber = row.getValue('guideNumber') as string | null
        return guideNumber || '-'
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (!cellValue) return false
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
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
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const patient = row.original

        return <ColumnActions patient={patient} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      },
    },
  ]
}
