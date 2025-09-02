'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { HealthPlan } from '@/app/db/schemas/health-plan-schema'

import { createColumns, DataTable } from '@/components/data-tables/health-plans'
import { HealthPlanForm } from '@/components/health-plan-form'
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

import { useDeleteHealthPlan, useHealthPlans } from '@/hooks/use-health-plans'

function PlanosSaudePageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHealthPlan, setEditingHealthPlan] = useState<HealthPlan | undefined>()
  const [deletingHealthPlan, setDeletingHealthPlan] = useState<HealthPlan | null>(null)

  const { data: healthPlans, isLoading, error } = useHealthPlans()
  const deleteMutation = useDeleteHealthPlan()

  const handleEdit = (healthPlan: HealthPlan) => {
    setEditingHealthPlan(healthPlan)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingHealthPlan) {
      try {
        await deleteMutation.mutateAsync(deletingHealthPlan.id)
        setDeletingHealthPlan(null)
      } catch (error) {
        console.error('Erro ao excluir plano de saúde:', error)
      }
    }
  }

  const handleNewHealthPlan = () => {
    setEditingHealthPlan(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingHealthPlan(undefined)
  }

  // Criar as colunas com as ações
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: setDeletingHealthPlan,
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Saúde</h1>
          <p className="text-muted-foreground">Gerencie os planos de saúde do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar planos de saúde: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Saúde</h1>
          <p className="text-muted-foreground">Gerencie os planos de saúde do sistema</p>
        </div>

        <Button onClick={handleNewHealthPlan}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano de Saúde
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando planos de saúde...</span>
        </div>
      ) : healthPlans && healthPlans.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhum plano de saúde cadastrado.</div>
      ) : (
        <DataTable columns={columns} data={healthPlans || []} />
      )}

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingHealthPlan ? 'Editar Plano de Saúde' : 'Novo Plano de Saúde'}</DialogTitle>
            <DialogDescription>
              {editingHealthPlan
                ? 'Atualize as informações do plano de saúde.'
                : 'Adicione um novo plano de saúde ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <HealthPlanForm healthPlan={editingHealthPlan} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingHealthPlan} onOpenChange={() => setDeletingHealthPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano de saúde &quot;{deletingHealthPlan?.name}?&quot; Esta ação não pode
              ser desfeita.
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

export default function PlanosSaudePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Planos de Saúde</h1>
              <p className="text-muted-foreground">Gerencie os planos de saúde do sistema</p>
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
      <PlanosSaudePageContent />
    </Suspense>
  )
}
