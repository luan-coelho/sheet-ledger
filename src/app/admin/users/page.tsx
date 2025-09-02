'use client'

import { Activity, Loader2, MoreHorizontal, Pencil, Plus, UserCheck, UserX } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Suspense, useMemo, useState } from 'react'

import { User } from '@/app/db/schemas/user-schema'

import { ActivityLogsViewer } from '@/components/activity-logs-viewer'
import { PaginationControls } from '@/components/pagination-controls'
import { SearchBar } from '@/components/search-bar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserForm } from '@/components/user-form'

import { usePagination } from '@/hooks/use-pagination'
import { useSearchFilter } from '@/hooks/use-search-filter'
import { useDeleteUser, useToggleUserStatus, useUsers } from '@/hooks/use-users'

function UsuariosPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [togglingUser, setTogglingUser] = useState<User | null>(null)
  const [viewingLogsUser, setViewingLogsUser] = useState<User | null>(null)

  const { data: session } = useSession()
  const { data: users, isLoading, error } = useUsers()
  const deleteMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  // Hook para gerenciar filtro de busca
  const { searchFilter, setSearchFilter, clearSearchFilter } = useSearchFilter({
    paramName: 'search',
    resetPagination: true,
  })

  // Filtrar usuários por nome ou email
  const filteredUsers = useMemo(() => {
    if (!users) return []

    return users.filter(user => {
      return (
        user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(searchFilter.toLowerCase())
      )
    })
  }, [users, searchFilter])

  // Hook para gerenciar paginação
  const pagination = usePagination({
    itemsPerPage: 4,
    totalItems: filteredUsers.length,
  })

  // Obter usuários da página atual
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(pagination.startIndex, pagination.endIndex)
  }, [filteredUsers, pagination.startIndex, pagination.endIndex])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleViewLogs = (user: User) => {
    setViewingLogsUser(user)
  }

  const handleDelete = async () => {
    if (deletingUser) {
      try {
        await deleteMutation.mutateAsync(deletingUser.id)
        setDeletingUser(null)
      } catch (error) {
        console.error('Erro ao desativar usuário:', error)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (togglingUser) {
      try {
        await toggleStatusMutation.mutateAsync({
          id: togglingUser.id,
          active: !togglingUser.active,
        })
        setTogglingUser(null)
      } catch (error) {
        console.error('Erro ao alterar status do usuário:', error)
      }
    }
  }

  const handleNewUser = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingUser(undefined)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar usuários: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>

        <Button onClick={handleNewUser}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <SearchBar
              value={searchFilter}
              onChange={setSearchFilter}
              onClear={clearSearchFilter}
              placeholder="Buscar por nome ou email..."
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando usuários...</span>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {searchFilter ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário cadastrado.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map(user => {
                    const isCurrentUser = session?.user?.email === user.email
                    return (
                      <TableRow key={user.id} className={isCurrentUser ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.active ? 'default' : 'secondary'}>
                            {user.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.updatedAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isCurrentUser ? (
                                <DropdownMenuItem onClick={() => handleViewLogs(user)}>
                                  <Activity className="mr-2 h-4 w-4" />
                                  Ver Logs
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewLogs(user)}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Ver Logs
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setTogglingUser(user)}>
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
                                  <DropdownMenuItem
                                    onClick={() => setDeletingUser(user)}
                                    className="text-destructive focus:text-destructive">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar permanentemente
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Controles de Paginação */}
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={filteredUsers.length}
                itemsPerPage={pagination.itemsPerPage}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                visiblePages={pagination.getVisiblePages()}
                onPageChange={pagination.setPage}
                onFirstPage={pagination.goToFirstPage}
                onLastPage={pagination.goToLastPage}
                onNextPage={pagination.nextPage}
                onPreviousPage={pagination.previousPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Faça as alterações necessárias no usuário.'
                : 'Preencha os dados para criar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>

          <UserForm user={editingUser} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Desativação */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o usuário &quot;{deletingUser?.name}?&quot; O usuário não conseguirá mais
              fazer login no sistema. Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Alteração de Status */}
      <AlertDialog open={!!togglingUser} onOpenChange={() => setTogglingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingUser?.active ? 'Desativar' : 'Ativar'} usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {togglingUser?.active ? 'desativar' : 'ativar'} o usuário &quot;
              {togglingUser?.name}?&quot;
              {togglingUser?.active && ' O usuário não conseguirá mais fazer login no sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleStatusMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={toggleStatusMutation.isPending}>
              {toggleStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {togglingUser?.active ? 'Desativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Logs de Atividades */}
      <Dialog open={!!viewingLogsUser} onOpenChange={() => setViewingLogsUser(null)}>
        <DialogContent className="max-h-[80vh] min-w-[60vw] overflow-y-auto">
          <DialogTitle className="sr-only">Logs de Atividades - {viewingLogsUser?.name}</DialogTitle>
          {viewingLogsUser && <ActivityLogsViewer userId={viewingLogsUser.id} userName={viewingLogsUser.name} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsuariosPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
              <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      }>
      <UsuariosPageContent />
    </Suspense>
  )
}
