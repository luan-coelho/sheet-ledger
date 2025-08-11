'use client'

import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Therapy } from '@/app/db/schemas/therapy-schema'

import { TherapyForm } from '@/components/therapy-form'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteTherapy, useTherapies } from '@/hooks/use-therapies'

export default function TerapiasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTherapy, setEditingTherapy] = useState<Therapy | undefined>()
  const [deletingTherapy, setDeletingTherapy] = useState<Therapy | null>(null)

  const { data: therapies, isLoading, error } = useTherapies()
  const deleteMutation = useDeleteTherapy()

  const handleEdit = (therapy: Therapy) => {
    setEditingTherapy(therapy)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingTherapy) {
      try {
        await deleteMutation.mutateAsync(deletingTherapy.id)
        setDeletingTherapy(null)
      } catch (error) {
        console.error('Erro ao excluir terapia:', error)
      }
    }
  }

  const handleNewTherapy = () => {
    setEditingTherapy(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTherapy(undefined)
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
          <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
          <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar terapias: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
          <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
        </div>

        <Button onClick={handleNewTherapy}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Terapia
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Terapias</CardTitle>
          <CardDescription>{therapies?.length || 0} terapia(s) cadastrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando terapias...</span>
            </div>
          ) : therapies && therapies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {therapies.map(therapy => (
                  <TableRow key={therapy.id}>
                    <TableCell className="font-medium">{therapy.name}</TableCell>
                    <TableCell>
                      <Badge variant={therapy.active ? 'default' : 'secondary'}>
                        {therapy.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(therapy.createdAt)}</TableCell>
                    <TableCell>{formatDate(therapy.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(therapy)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingTherapy(therapy)} className="text-destructive">
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
              <p className="text-muted-foreground mb-4">Nenhuma terapia cadastrada ainda.</p>
              <Button onClick={handleNewTherapy}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeira Terapia
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTherapy ? 'Editar Terapia' : 'Nova Terapia'}</DialogTitle>
            <DialogDescription>
              {editingTherapy ? 'Atualize as informações da terapia.' : 'Adicione uma nova terapia ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <TherapyForm therapy={editingTherapy} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTherapy} onOpenChange={() => setDeletingTherapy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a terapia &quot;{deletingTherapy?.name}?&quot; Esta ação não pode ser
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
