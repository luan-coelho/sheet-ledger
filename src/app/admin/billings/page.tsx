'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Receipt } from 'lucide-react'
import { useState } from 'react'

import { insertBillingSchema } from '@/app/db/schemas/billing-schema'

import { BillingEditForm } from '@/components/billing-edit-form'
import { BillingForm } from '@/components/billing-form'
import { createColumns } from '@/components/data-tables/billings/columns'
import { DataTable } from '@/components/data-tables/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useBillings, useCreateMultipleBillings, useDeleteBilling, useUpdateBilling } from '@/hooks/use-billings'

import { centsToDecimal, formatCurrency } from '@/lib/billing-utils'

export default function BillingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingBilling, setEditingBilling] = useState<any>(null)

  const { data, isLoading } = useBillings()
  const createMultipleMutation = useCreateMultipleBillings()
  const updateMutation = useUpdateBilling()
  const deleteMutation = useDeleteBilling()

  const billings = data?.billings || []
  const summary = data?.summary

  const handleCreate = async (billings: Array<ReturnType<typeof insertBillingSchema.parse>>) => {
    try {
      await createMultipleMutation.mutateAsync(billings)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating billings:', error)
    }
  }

  const handleEdit = (billing: any) => {
    setEditingBilling(billing)
    setIsEditFormOpen(true)
  }

  const handleUpdate = async (formData: any) => {
    if (!editingBilling?.id) return

    try {
      await updateMutation.mutateAsync({
        id: editingBilling.id,
        data: formData,
      })
      setEditingBilling(null)
      setIsEditFormOpen(false)
    } catch (error) {
      console.error('Error updating billing:', error)
    }
  }

  const handleDelete = async (billing: any) => {
    if (!confirm('Tem certeza que deseja excluir este faturamento?')) return

    try {
      await deleteMutation.mutateAsync(billing.id)
    } catch (error) {
      console.error('Error deleting billing:', error)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false)
    setEditingBilling(null)
  }

  // Preparar dados para edição
  const editFormValues = editingBilling
    ? {
        patientId: editingBilling.patientId,
        therapyId: editingBilling.therapyId || '',
        healthPlanId: editingBilling.healthPlanId || '',
        competence: editingBilling.competenceDate
          ? format(new Date(editingBilling.competenceDate), 'MM/yyyy', { locale: ptBR })
          : '',
        sessionValue: editingBilling.sessionValueCents
          ? centsToDecimal(editingBilling.sessionValueCents).toFixed(2).replace('.', ',')
          : '',
        grossAmount: editingBilling.grossAmountCents
          ? centsToDecimal(editingBilling.grossAmountCents).toFixed(2).replace('.', ',')
          : '',
        netAmount: editingBilling.netAmountCents
          ? centsToDecimal(editingBilling.netAmountCents).toFixed(2).replace('.', ',')
          : '',
        dueDate: editingBilling.dueDate ? format(new Date(editingBilling.dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '',
        invoiceIssuedAt: editingBilling.invoiceIssuedAt
          ? format(new Date(editingBilling.invoiceIssuedAt), 'dd/MM/yyyy', { locale: ptBR })
          : '',
        invoiceNumber: editingBilling.invoiceNumber || '',
        billerName: editingBilling.billerName || '',
        status: editingBilling.status,
        isBilled: editingBilling.isBilled,
        notes: editingBilling.notes || '',
      }
    : undefined

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturamentos</h1>
          <p className="text-muted-foreground">Gerencie os faturamentos e controle os prazos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="default">
          <Receipt className="mr-2 h-4 w-4" />
          Novo Faturamento
        </Button>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Bruto Total</CardTitle>
              <Receipt className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalGrossCents || 0)}</div>
              <p className="text-muted-foreground text-xs">Soma de todos os faturamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Líquido Total</CardTitle>
              <Receipt className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.totalNetCents || 0)}</div>
              <p className="text-muted-foreground text-xs">Valor após descontos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Receipt className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.pendingCount || 0}</div>
              <p className="text-muted-foreground text-xs">Faturamentos não pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <Receipt className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.paidCount || 0}</div>
              <p className="text-muted-foreground text-xs">Faturamentos concluídos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Faturamentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os faturamentos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={createColumns({
                onEdit: handleEdit,
                onDelete: handleDelete,
              })}
              data={billings}
            />
          )}
        </CardContent>
      </Card>

      {/* Billing Form Dialog */}
      <BillingForm open={isFormOpen} onOpenChange={handleCloseForm} onSubmit={handleCreate} mode="create" />

      {/* Billing Edit Form Dialog */}
      <BillingEditForm
        open={isEditFormOpen}
        onOpenChange={handleCloseEditForm}
        onSubmit={handleUpdate}
        defaultValues={editFormValues}
      />
    </div>
  )
}
