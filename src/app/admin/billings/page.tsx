'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Receipt } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { BillingEditForm } from '@/components/billing-edit-form'
import { createColumns } from '@/components/data-tables/billings/columns'
import { DataTable } from '@/components/data-tables/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useBillings, useDeleteBilling, useUpdateBilling } from '@/hooks/use-billings'

import { centsToDecimal, formatCurrency } from '@/lib/billing-utils'

export default function BillingsPage() {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingBilling, setEditingBilling] = useState<any>(null)

  const { data, isLoading } = useBillings()
  const updateMutation = useUpdateBilling()
  const deleteMutation = useDeleteBilling()

  // Dados já vêm ordenados do backend
  const billings = data?.billings || []
  const summary = data?.summary

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
        <Link href="/admin/billings/new">
          <Button size="default">
            <Plus className="mr-2 h-4 w-4" />
            Novo Faturamento
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="gap-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950/30">
                  <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-muted-foreground text-sm font-medium">Atrasados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{summary?.overdueCount || 0}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-end rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-400">
                  Urgente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-950/30">
                  <Receipt className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-muted-foreground text-sm font-medium">Pendentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{summary?.pendingCount || 0}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400">
                  Em andamento
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-950/30">
                  <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-muted-foreground text-sm font-medium">Pagos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{summary?.paidCount || 0}</div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
                  Concluído
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-muted-foreground text-sm font-medium">Valor Bruto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(summary?.totalGrossCents || 0)}</div>
              <p className="text-muted-foreground text-xs">Total faturado</p>
            </CardContent>
          </Card>

          <Card className="gap-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/30">
                  <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-muted-foreground text-sm font-medium">Valor Líquido</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(summary?.totalNetCents || 0)}</div>
              <p className="text-muted-foreground text-xs">Após descontos</p>
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
