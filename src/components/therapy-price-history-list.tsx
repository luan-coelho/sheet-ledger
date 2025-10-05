'use client'

import { Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { TherapyPriceHistoryWithFormatted } from '@/app/db/schemas/therapy-price-history-schema'

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteTherapyPriceHistory, useTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

import { formatCurrency } from '@/services/therapy-price-history-service'

import { TherapyPriceForm } from './therapy-price-form'

interface TherapyPriceHistoryListProps {
  therapyId: string
  therapyName?: string
}

export function TherapyPriceHistoryList({ therapyId, therapyName }: TherapyPriceHistoryListProps) {
  const { data: priceHistory, isLoading } = useTherapyPriceHistory(therapyId)
  const deleteMutation = useDeleteTherapyPriceHistory()

  const [editingPrice, setEditingPrice] = useState<TherapyPriceHistoryWithFormatted | null>(null)
  const [deletingPriceId, setDeletingPriceId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (price: TherapyPriceHistoryWithFormatted) => {
    setEditingPrice(price)
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setDeletingPriceId(null)
  }

  const formatCompetenceDisplay = (competence: string) => {
    const [year, month] = competence.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const getPriceChange = (currentIndex: number): { percentage: number; isIncrease: boolean } | null => {
    if (!priceHistory || currentIndex >= priceHistory.length - 1) {
      return null
    }

    const currentPrice = priceHistory[currentIndex].value
    const previousPrice = priceHistory[currentIndex + 1].value

    if (previousPrice === 0) return null

    const percentage = ((currentPrice - previousPrice) / previousPrice) * 100

    return {
      percentage: Math.abs(percentage),
      isIncrease: percentage > 0,
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Valores</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      {!priceHistory || priceHistory.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          <p>Nenhum valor cadastrado ainda.</p>
          <p className="text-sm">Clique no botão acima para adicionar o primeiro valor.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Variação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceHistory.map((price, index) => {
              const priceChange = getPriceChange(index)
              const isCurrentMonth = price.competence === new Date().toISOString().substring(0, 7)

              return (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {formatCompetenceDisplay(price.competence)}
                      {isCurrentMonth && (
                        <Badge variant="outline" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(price.value)}</TableCell>
                  <TableCell className="text-right">
                    {priceChange ? (
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          priceChange.isIncrease ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {priceChange.isIncrease ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {priceChange.isIncrease ? '+' : '-'}
                          {priceChange.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(price)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPriceId(price.id)} title="Deletar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Valor
        </Button>
      </div>

      {/* Dialog para adicionar novo valor */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Valor</DialogTitle>
            <DialogDescription>Cadastre um novo valor para a terapia {therapyName || ''}.</DialogDescription>
          </DialogHeader>
          <TherapyPriceForm
            therapyId={therapyId}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar valor */}
      <Dialog open={!!editingPrice} onOpenChange={() => setEditingPrice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Valor</DialogTitle>
            <DialogDescription>
              Atualize o valor da terapia para{' '}
              {editingPrice?.competence && formatCompetenceDisplay(editingPrice.competence)}.
            </DialogDescription>
          </DialogHeader>
          {editingPrice && (
            <TherapyPriceForm
              therapyId={therapyId}
              priceHistory={editingPrice}
              onSuccess={() => setEditingPrice(null)}
              onCancel={() => setEditingPrice(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert dialog para confirmar exclusão */}
      <AlertDialog open={!!deletingPriceId} onOpenChange={() => setDeletingPriceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este valor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPriceId && handleDelete(deletingPriceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
