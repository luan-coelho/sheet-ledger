'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { Company } from '@/app/db/schemas/company-schema'

import { CompanyForm } from '@/components/company-form'
import { createColumns, DataTable } from '@/components/data-tables/companies'
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

import { useCompanies, useDeleteCompany } from '@/hooks/use-companies'

function EmpresasPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>()
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)

  const { data: companies, isLoading, error } = useCompanies()
  const deleteMutation = useDeleteCompany()

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingCompany) {
      try {
        await deleteMutation.mutateAsync(deletingCompany.id)
        setDeletingCompany(null)
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      }
    }
  }

  const handleNewCompany = () => {
    setEditingCompany(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCompany(undefined)
  }

  // Criar as colunas com as ações
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: setDeletingCompany,
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar empresas: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas do sistema</p>
        </div>

        <Button onClick={handleNewCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando empresas...</span>
        </div>
      ) : companies && companies.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">Nenhuma empresa cadastrada.</div>
      ) : (
        <DataTable columns={columns} data={companies || []} />
      )}

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent
          className="md:min-w-3xl"
          onInteractOutside={e => {
            e.preventDefault()
          }}>
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize as informações da empresa.' : 'Adicione uma nova empresa ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <CompanyForm company={editingCompany} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa &quot;{deletingCompany?.name}?&quot; Esta ação não pode ser
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

export default function EmpresasPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
              <p className="text-muted-foreground">Gerencie as empresas do sistema</p>
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
      <EmpresasPageContent />
    </Suspense>
  )
}
