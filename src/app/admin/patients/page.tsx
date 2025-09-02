'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { Patient } from '@/app/db/schemas/patient-schema'

import { createColumns, DataTable } from '@/components/data-tables/patients'
import { PatientForm } from '@/components/patient-form'
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

import { useHealthPlans } from '@/hooks/use-health-plans'
import { useDeletePatient, usePatients } from '@/hooks/use-patients'

function PacientesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>()
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)

  const { data: patients, isLoading, error } = usePatients()
  const { data: healthPlans } = useHealthPlans()
  const deleteMutation = useDeletePatient()

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingPatient) {
      try {
        await deleteMutation.mutateAsync(deletingPatient.id)
        setDeletingPatient(null)
      } catch (error) {
        console.error('Erro ao excluir paciente:', error)
      }
    }
  }

  const handleNewPatient = () => {
    setEditingPatient(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPatient(undefined)
  }

  // Criar as colunas com as ações
  const columns = createColumns(healthPlans, {
    onEdit: handleEdit,
    onDelete: setDeletingPatient,
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie os pacientes do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar pacientes: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie os pacientes do sistema</p>
        </div>

        <Button onClick={handleNewPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando pacientes...</span>
        </div>
      ) : patients && patients.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhum paciente cadastrado.</div>
      ) : (
        <DataTable columns={columns} data={patients || []} />
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Atualize as informações do paciente.' : 'Adicione um novo paciente ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <PatientForm patient={editingPatient} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente &quot;{deletingPatient?.name}?&quot; Esta ação não pode ser
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

export default function PacientesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
              <p className="text-muted-foreground">Gerencie os pacientes do sistema</p>
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
      <PacientesPageContent />
    </Suspense>
  )
}
