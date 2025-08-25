'use client'

import { Loader2, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { Patient } from '@/app/db/schemas/patient-schema'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useHealthPlans } from '@/hooks/use-health-plans'
import { useDeletePatient, usePatients } from '@/hooks/use-patients'

export default function PacientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>()
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilter, setSearchFilter] = useState('')
  const itemsPerPage = 10

  const { data: patients, isLoading, error } = usePatients()
  const { data: healthPlans } = useHealthPlans()
  const deleteMutation = useDeletePatient()

  // Filtrar pacientes por nome
  const filteredPatients =
    patients?.filter(patient => patient.name.toLowerCase().includes(searchFilter.toLowerCase())) || []

  // Calcular paginação dos pacientes filtrados
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

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

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingPatient) {
      try {
        await deleteMutation.mutateAsync(deletingPatient.id)
        setDeletingPatient(null)

        // Ajustar página atual se necessário
        const newTotalItems = filteredPatients.length - 1
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
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

  const getHealthPlanName = (healthPlanId: string | null) => {
    if (!healthPlanId) return '-'
    const healthPlan = healthPlans?.find(plan => plan.id === healthPlanId)
    return healthPlan?.name || 'Plano não encontrado'
  }

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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {searchFilter ? (
              <>
                {filteredPatients.length} paciente(s) encontrado(s) de {patients?.length || 0} total
                {filteredPatients.length > itemsPerPage && (
                  <span>
                    {' '}
                    - Página {currentPage} de {totalPages}
                  </span>
                )}
              </>
            ) : (
              <>
                {patients?.length || 0} paciente(s) cadastrado(s)
                {patients && patients.length > itemsPerPage && (
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
          <div className="mb-6 flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Buscar por nome..."
                value={searchFilter}
                onChange={e => handleSearchChange(e.target.value)}
                className="pr-10 pl-10"
              />
              {searchFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando pacientes...</span>
            </div>
          ) : filteredPatients.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Plano de Saúde</TableHead>
                    <TableHead>N° Carteirinha</TableHead>
                    <TableHead>N° Guia</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-[70px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map(patient => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.guardian}</TableCell>
                      <TableCell>{getHealthPlanName(patient.healthPlanId)}</TableCell>
                      <TableCell>{patient.cardNumber || '-'}</TableCell>
                      <TableCell>{patient.guideNumber || '-'}</TableCell>
                      <TableCell>{formatDate(patient.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(patient)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingPatient(patient)} className="text-destructive">
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
            <div className="py-8 text-center">
              {searchFilter ? (
                <div>
                  <p className="text-muted-foreground mb-4">
                    Nenhum paciente encontrado com o nome &quot;{searchFilter}&quot;.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtro
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">Nenhum paciente cadastrado ainda.</p>
                  <Button onClick={handleNewPatient}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Paciente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
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
