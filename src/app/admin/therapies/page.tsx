'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { Therapy } from '@/app/db/schemas/therapy-schema'

import { createColumns, DataTable } from '@/components/data-tables/therapies'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { useDeleteTherapy, useTherapies } from '@/hooks/use-therapies'

function TerapiasPageContent() {
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

  // Criar as colunas com as ações
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: setDeletingTherapy,
  })

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

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando terapias...</span>
        </div>
      ) : therapies && therapies.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhuma terapia cadastrada.</div>
      ) : (
        <DataTable columns={columns} data={therapies || []} />
      )}

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

export default function TerapiasPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
              <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
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
      <TerapiasPageContent />
    </Suspense>
  )
}
