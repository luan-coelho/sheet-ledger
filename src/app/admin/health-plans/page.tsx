"use client"

import { useState } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthPlanForm } from '@/components/health-plan-form'
import { useHealthPlans, useDeleteHealthPlan } from '@/hooks/use-health-plans'
import { HealthPlan } from '@/lib/schemas/health-plan-schema'

export default function PlanosSaudePage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Planos de Saúde</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de saúde do sistema
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Erro ao carregar planos de saúde: {error.message}
            </div>
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
          <p className="text-muted-foreground">
            Gerencie os planos de saúde do sistema
          </p>
        </div>
        
        <Button onClick={handleNewHealthPlan}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano de Saúde
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos de Saúde</CardTitle>
          <CardDescription>
            {healthPlans?.length || 0} plano(s) de saúde cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando planos de saúde...</span>
            </div>
          ) : healthPlans && healthPlans.length > 0 ? (
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
                {healthPlans.map((healthPlan) => (
                  <TableRow key={healthPlan.id}>
                    <TableCell className="font-medium">
                      {healthPlan.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(healthPlan.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(healthPlan.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(healthPlan)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingHealthPlan(healthPlan)}
                            className="text-destructive"
                          >
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
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhum plano de saúde cadastrado ainda.
              </p>
              <Button onClick={handleNewHealthPlan}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Plano de Saúde
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingHealthPlan ? 'Editar Plano de Saúde' : 'Novo Plano de Saúde'}
            </DialogTitle>
            <DialogDescription>
              {editingHealthPlan
                ? 'Atualize as informações do plano de saúde.'
                : 'Adicione um novo plano de saúde ao sistema.'}
            </DialogDescription>
          </DialogHeader>
          
          <HealthPlanForm
            healthPlan={editingHealthPlan}
            onSuccess={handleModalClose}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingHealthPlan}
        onOpenChange={() => setDeletingHealthPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano de saúde "{deletingHealthPlan?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
