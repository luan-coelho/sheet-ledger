'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { HealthPlanForm } from '@/components/health-plan-form'
import { useHealthPlans, useDeleteHealthPlan } from '@/hooks/use-health-plans'
import { HealthPlan } from '@/app/db/schemas/health-plan-schema'

export default function PlanosSaudePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHealthPlan, setEditingHealthPlan] = useState<HealthPlan | undefined>()
  const [deletingHealthPlan, setDeletingHealthPlan] = useState<HealthPlan | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilter, setSearchFilter] = useState('')
  const itemsPerPage = 10

  const { data: healthPlans, isLoading, error } = useHealthPlans()
  const deleteMutation = useDeleteHealthPlan()

  // Filtrar planos de saúde por nome
  const filteredHealthPlans =
    healthPlans?.filter(healthPlan => healthPlan.name.toLowerCase().includes(searchFilter.toLowerCase())) || []

  // Calcular paginação dos planos de saúde filtrados
  const totalPages = Math.ceil(filteredHealthPlans.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHealthPlans = filteredHealthPlans.slice(startIndex, endIndex)

  // Gerar páginas para navegação
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleEdit = (healthPlan: HealthPlan) => {
    setEditingHealthPlan(healthPlan)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingHealthPlan) {
      try {
        await deleteMutation.mutateAsync(deletingHealthPlan.id)
        setDeletingHealthPlan(null)

        // Ajustar página atual se necessário
        const newTotalItems = filteredHealthPlans.length - 1
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchFilter(value)
    setCurrentPage(1) // Resetar para primeira página ao filtrar
  }

  const clearSearch = () => {
    setSearchFilter('')
    setCurrentPage(1)
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
          <p className="text-muted-foreground">Gerencie os planos de saúde do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Erro ao carregar planos de saúde: {error.message}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos de Saúde</CardTitle>
          <CardDescription>
            {searchFilter ? (
              <>
                {filteredHealthPlans.length} plano(s) de saúde encontrado(s) de {healthPlans?.length || 0} total
                {filteredHealthPlans.length > itemsPerPage && (
                  <span>
                    {' '}
                    - Página {currentPage} de {totalPages}
                  </span>
                )}
              </>
            ) : (
              <>
                {healthPlans?.length || 0} plano(s) de saúde cadastrado(s)
                {healthPlans && healthPlans.length > itemsPerPage && (
                  <span>
                    {' '}
                    - Página {currentPage} de {totalPages}
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Campo de filtro */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome..."
                value={searchFilter}
                onChange={e => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando planos de saúde...</span>
            </div>
          ) : filteredHealthPlans.length > 0 ? (
            <>
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
                  {paginatedHealthPlans.map(healthPlan => (
                    <TableRow key={healthPlan.id}>
                      <TableCell className="font-medium">{healthPlan.name}</TableCell>
                      <TableCell>{formatDate(healthPlan.createdAt)}</TableCell>
                      <TableCell>{formatDate(healthPlan.updatedAt)}</TableCell>
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

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page as number)}
                              isActive={currentPage === page}
                              className="cursor-pointer">
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              {searchFilter ? (
                <div>
                  <p className="text-muted-foreground mb-4">
                    Nenhum plano de saúde encontrado com o nome &quot;{searchFilter}&quot;.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtro
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">Nenhum plano de saúde cadastrado ainda.</p>
                  <Button onClick={handleNewHealthPlan}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Plano de Saúde
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
