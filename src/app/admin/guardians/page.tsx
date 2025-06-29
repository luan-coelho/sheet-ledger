'use client'

import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Guardian } from '@/app/db/schemas/guardian-schema'

import { GuardianForm } from '@/components/guardian-form'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteGuardian, useGuardians } from '@/hooks/use-guardians'

export default function ResponsaveisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGuardian, setEditingGuardian] = useState<Guardian | undefined>()
  const [deletingGuardian, setDeletingGuardian] = useState<Guardian | null>(null)

  const { data: guardians, isLoading, error } = useGuardians()
  const deleteMutation = useDeleteGuardian()

  const handleEdit = (guardian: Guardian) => {
    setEditingGuardian(guardian)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingGuardian) {
      try {
        await deleteMutation.mutateAsync(deletingGuardian.id)
        setDeletingGuardian(null)
      } catch (error) {
        console.error('Erro ao excluir responsável:', error)
      }
    }
  }

  const handleNewGuardian = () => {
    setEditingGuardian(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingGuardian(undefined)
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
          <h1 className="text-3xl font-bold tracking-tight">Responsáveis</h1>
          <p className="text-muted-foreground">Gerencie os responsáveis do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar responsáveis: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Responsáveis</h1>
          <p className="text-muted-foreground">Gerencie os responsáveis do sistema</p>
        </div>

        <Button onClick={handleNewGuardian}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Responsável
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Responsáveis</CardTitle>
          <CardDescription>{guardians?.length || 0} responsável(is) cadastrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando responsáveis...</span>
            </div>
          ) : guardians && guardians.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardians.map(guardian => (
                  <TableRow key={guardian.id}>
                    <TableCell className="font-medium">{guardian.name}</TableCell>
                    <TableCell>{formatDate(guardian.createdAt)}</TableCell>
                    <TableCell>{formatDate(guardian.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(guardian)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingGuardian(guardian)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum responsável cadastrado ainda.</p>
              <Button onClick={handleNewGuardian}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Responsável
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGuardian ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle>
            <DialogDescription>
              {editingGuardian ? 'Atualize as informações do responsável.' : 'Adicione um novo responsável ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <GuardianForm guardian={editingGuardian} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingGuardian} onOpenChange={() => setDeletingGuardian(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o responsável &quot;{deletingGuardian?.name}?&quot; Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
