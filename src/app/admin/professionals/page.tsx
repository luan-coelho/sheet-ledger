'use client'

import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Professional, ProfessionalWithTherapy } from '@/app/db/schemas/professional-schema'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteProfessional, useProfessionals } from '@/hooks/use-professionals'

export default function ProfissionaisPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalWithTherapy | undefined>()
  const [deletingProfessional, setDeletingProfessional] = useState<ProfessionalWithTherapy | null>(null)

  const { data: professionals, isLoading, error } = useProfessionals()
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>{professionals?.length || 0} profissional(is) cadastrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando profissionais...</span>
            </div>
          ) : professionals && professionals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nº Conselho</TableHead>
                  <TableHead>Terapia</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map(professional => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell>{professional.councilNumber || '-'}</TableCell>
                    <TableCell>
                      {professional.therapy ? (
                        <span className="text-sm">{professional.therapy.name}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhuma terapia</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(professional.createdAt)}</TableCell>
                    <TableCell>{formatDate(professional.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(professional)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingProfessional(professional)}
                            className="text-destructive">
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
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum profissional cadastrado ainda.</p>
              <Button onClick={handleNewProfessional}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Profissional
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfessionalModal open={isModalOpen} onOpenChange={handleModalClose} professional={editingProfessional} />

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
