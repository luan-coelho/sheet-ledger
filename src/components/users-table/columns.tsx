'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Activity, ArrowUpDown, MoreHorizontal, Pencil, UserCheck, UserX } from 'lucide-react'

import { User } from '@/app/db/schemas/user-schema'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ColumnActionsProps {
  user: User
  isCurrentUser: boolean
  onEdit: (user: User) => void
  onViewLogs: (user: User) => void
  onToggleStatus: (user: User) => void
  onDelete: (user: User) => void
}

function ColumnActions({ user, isCurrentUser, onEdit, onViewLogs, onToggleStatus, onDelete }: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isCurrentUser ? (
          <DropdownMenuItem onClick={() => onViewLogs(user)}>
            <Activity className="mr-2 h-4 w-4" />
            Ver Logs
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewLogs(user)}>
              <Activity className="mr-2 h-4 w-4" />
              Ver Logs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(user)}>
              {user.active ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Desativar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Ativar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive">
              <UserX className="mr-2 h-4 w-4" />
              Desativar permanentemente
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function createColumns(
  currentUserEmail: string | undefined,
  actions: {
    onEdit: (user: User) => void
    onViewLogs: (user: User) => void
    onToggleStatus: (user: User) => void
    onDelete: (user: User) => void
  },
): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        const isCurrentUser = currentUserEmail === user.email

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{user.name}</span>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                Você
              </Badge>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            E-mail
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isActive = row.getValue('active') as boolean
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true
        if (value === 'active') return row.getValue(id) === true
        if (value === 'inactive') return row.getValue(id) === false
        return true
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Criado em
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
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
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Atualizado em
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
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
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        const isCurrentUser = currentUserEmail === user.email

        return (
          <ColumnActions
            user={user}
            isCurrentUser={isCurrentUser}
            onEdit={actions.onEdit}
            onViewLogs={actions.onViewLogs}
            onToggleStatus={actions.onToggleStatus}
            onDelete={actions.onDelete}
          />
        )
      },
    },
  ]
}
