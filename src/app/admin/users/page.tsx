'use client'

import { Loader2, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Suspense, useState } from 'react'

import { User } from '@/app/db/schemas/user-schema'

import { ActivityLogsViewer } from '@/components/activity-logs-viewer'
import { createColumns, DataTable } from '@/components/data-tables/users'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserForm } from '@/components/user-form'

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

  // Criar as colunas com as ações
  const columns = createColumns(session?.user?.email ?? undefined, {
    onEdit: handleEdit,
    onViewLogs: handleViewLogs,
    onToggleStatus: setTogglingUser,
    onDelete: setDeletingUser,
  })

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

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando usuários...</span>
        </div>
      ) : users && users.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhum usuário cadastrado.</div>
      ) : (
        <DataTable columns={columns} data={users || []} />
      )}

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
