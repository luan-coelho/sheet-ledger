'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Receipt } from 'lucide-react'
import { useState } from 'react'

import { insertBillingSchema } from '@/app/db/schemas/billing-schema'

import { BillingForm } from '@/components/billing-form'
import { createColumns } from '@/components/data-tables/billings/columns'
import { DataTable } from '@/components/data-tables/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useBillings, useCreateMultipleBillings, useDeleteBilling } from '@/hooks/use-billings'

import { formatCurrency } from '@/lib/billing-utils'

export default function BillingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useBillings()
  const createMultipleMutation = useCreateMultipleBillings()
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
                onDelete: handleDelete,
              })}
              data={billings}
            />
          )}
        </CardContent>
      </Card>

      {/* Billing Form Dialog */}
      <BillingForm open={isFormOpen} onOpenChange={handleCloseForm} onSubmit={handleCreate} mode="create" />
    </div>
  )
}
