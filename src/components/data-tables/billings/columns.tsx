'use client'

import { ColumnDef, Row } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
  formatCurrency,
  formatDueStatus,
  getBillingStatusLabel,
  getBillingStatusVariant,
  getDueStatusVariant,
} from '@/lib/billing-utils'

import { BillingWithRelations } from '@/services/billing-service'

function getRowClassName(billing: BillingWithRelations): string {
  const { status, dueDate } = billing

  // Verificar se está atrasado
  const isOverdue = dueDate && new Date(dueDate) < new Date()

  // Cores mais fortes baseadas no status e prazo
  if (isOverdue && status !== 'paid' && status !== 'cancelled') {
    return 'bg-red-100 hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-950/70 border-l-4 border-l-red-500'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:hover:bg-yellow-950/70',
    scheduled: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-950/70',
    sent: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-950/70',
    paid: 'bg-green-100 hover:bg-green-200 dark:bg-green-950/50 dark:hover:bg-green-950/70',
    cancelled: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-950/50 dark:hover:bg-gray-950/70',
  }
  return statusColors[status] || ''
}

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
  billing: BillingWithRelations
  onEdit: (billing: BillingWithRelations) => void
  onDelete: (billing: BillingWithRelations) => void
}

function ColumnActions({ billing, onEdit, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(billing)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(billing)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(actions: {
  onEdit: (billing: BillingWithRelations) => void
  onDelete: (billing: BillingWithRelations) => void
}): ColumnDef<BillingWithRelations>[] {
  return [
    {
      accessorKey: 'patientName',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Paciente
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por paciente...',
        },
        getRowClassName: (row: Row<BillingWithRelations>) => getRowClassName(row.original),
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.patientName || 'N/A'}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'therapy',
      header: 'Terapia',
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por terapia...',
        },
      },
      cell: ({ row }) => {
        const billing = row.original
        return billing.therapyName || billing.customTherapyName || '-'
      },
      filterFn: (row, id, value) => {
        const billing = row.original
        const therapyName = (billing.therapyName || billing.customTherapyName || '').toLowerCase()
        return therapyName.includes(value.toLowerCase())
      },
    },
    {
      accessorKey: 'healthPlanName',
      header: 'Plano de Saúde',
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por plano...',
        },
      },
      cell: ({ row }) => {
        return row.original.healthPlanName || '-'
      },
      filterFn: (row, id, value) => {
        const planName = (row.original.healthPlanName || '').toLowerCase()
        return planName.includes(value.toLowerCase())
      },
    },
    {
      accessorKey: 'grossAmountCents',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Valor Bruto
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      cell: ({ row }) => {
        return <span className="font-medium">{formatCurrency(row.original.grossAmountCents)}</span>
      },
    },
    {
      accessorKey: 'netAmountCents',
      header: 'Valor Líquido',
      cell: ({ row }) => {
        return formatCurrency(row.original.netAmountCents)
      },
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Prazo
            {getSortIcon(column.getIsSorted())}
          </Button>
        )
      },
      cell: ({ row }) => {
        const dueDate = row.original.dueDate

        if (!dueDate) {
          return <span className="text-muted-foreground">-</span>
        }

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{format(new Date(dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
            <Badge variant={getDueStatusVariant(dueDate)} className="w-fit text-xs">
              {formatDueStatus(dueDate)}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        if (!value) return true
        const rowDate = row.original.dueDate
        if (!rowDate) return false

        const filterDate = new Date(value)
        const cellDate = new Date(rowDate)

        return (
          cellDate.getFullYear() === filterDate.getFullYear() &&
          cellDate.getMonth() === filterDate.getMonth() &&
          cellDate.getDate() === filterDate.getDate()
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: {
        filterType: 'select',
        filterOptions: {
          placeholder: 'Filtrar por status',
          allLabel: 'Todos os status',
          items: [
            { value: 'pending', label: 'Pendente' },
            { value: 'scheduled', label: 'Agendado' },
            { value: 'sent', label: 'Enviado' },
            { value: 'paid', label: 'Pago' },
            { value: 'cancelled', label: 'Cancelado' },
          ],
        },
      },
      cell: ({ row }) => {
        const status = row.original.status
        return <Badge variant={getBillingStatusVariant(status)}>{getBillingStatusLabel(status)}</Badge>
      },
      filterFn: (row, id, value) => {
        return row.getValue(id) === value
      },
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'N° NF',
      meta: {
        filterType: 'text',
        filterOptions: {
          placeholder: 'Filtrar por NF...',
        },
      },
      cell: ({ row }) => {
        return row.original.invoiceNumber || '-'
      },
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string | null
        if (!cellValue) return false
        return cellValue.toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const billing = row.original
        return <ColumnActions billing={billing} onEdit={actions.onEdit} onDelete={actions.onDelete} />
      },
      meta: {
        getRowClassName: (row: Row<BillingWithRelations>) => getRowClassName(row.original),
      },
    },
  ]
}
