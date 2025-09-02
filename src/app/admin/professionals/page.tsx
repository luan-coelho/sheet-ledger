'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { ProfessionalWithTherapy } from '@/app/db/schemas/professional-schema'

import { createColumns, DataTable } from '@/components/data-tables/professionals'
import { ProfessionalModal } from '@/components/professional-modal'
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

import { useDeleteProfessional, useProfessionals } from '@/hooks/use-professionals'
import { useTherapies } from '@/hooks/use-therapies'

function ProfissionaisPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalWithTherapy | undefined>()
  const [deletingProfessional, setDeletingProfessional] = useState<ProfessionalWithTherapy | null>(null)

  const { data: professionals, isLoading, error } = useProfessionals()
  const { data: therapies } = useTherapies()
  const deleteMutation = useDeleteProfessional()

  const handleEdit = (professional: ProfessionalWithTherapy) => {
    setEditingProfessional(professional)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingProfessional) {
      try {
        await deleteMutation.mutateAsync(deletingProfessional.id)
        setDeletingProfessional(null)
      } catch (error) {
        console.error('Erro ao excluir profissional:', error)
      }
    }
  }

  const handleNewProfessional = () => {
    setEditingProfessional(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProfessional(undefined)
  }

  // Criar as colunas com as ações
  const columns = createColumns(therapies, {
    onEdit: handleEdit,
    onDelete: setDeletingProfessional,
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie os profissionais do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar profissionais: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie os profissionais do sistema</p>
        </div>

        <Button onClick={handleNewProfessional}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando profissionais...</span>
        </div>
      ) : professionals && professionals.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhum profissional cadastrado.</div>
      ) : (
        <DataTable columns={columns} data={professionals || []} />
      )}

      <ProfessionalModal open={isModalOpen} onOpenChange={handleModalClose} professional={editingProfessional} />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingProfessional} onOpenChange={() => setDeletingProfessional(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o profissional &quot;{deletingProfessional?.name}?&quot; Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
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

export default function ProfissionaisPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
              <p className="text-muted-foreground">Gerencie os profissionais do sistema</p>
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
      <ProfissionaisPageContent />
    </Suspense>
  )
}
