# Exemplo de Integração do Histórico de Preços na Página de Terapias

Este documento mostra como integrar o sistema de histórico de preços na página de listagem de terapias.

## Opção 1: Adicionar Botão de Gerenciar Preços na Tabela

Adicione uma coluna extra na tabela de terapias com um botão que abre um dialog com o histórico de preços.

### 1. Atualizar `data-tables/therapies/columns.tsx`

```typescript
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, DollarSign } from 'lucide-react'

import { Therapy } from '@/app/db/schemas/therapy-schema'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ColumnsOptions {
  onEdit: (therapy: Therapy) => void
  onDelete: (therapy: Therapy) => void
  onManagePrices?: (therapy: Therapy) => void // NOVO
}

export const createColumns = ({ onEdit, onDelete, onManagePrices }: ColumnsOptions): ColumnDef<Therapy>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean
      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const therapy = row.original

      return (
        <div className="flex items-center gap-2">
          {/* Botão de Gerenciar Preços - NOVO */}
          {onManagePrices && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManagePrices(therapy)}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Valores
            </Button>
          )}

          {/* Menu de ações existente */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(therapy)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(therapy)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
```

### 2. Atualizar `admin/therapies/page.tsx`

```typescript
'use client'

import { Loader2, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

import { Therapy } from '@/app/db/schemas/therapy-schema'

import { createColumns, DataTable } from '@/components/data-tables/therapies'
import { TherapyForm } from '@/components/therapy-form'
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list' // NOVO
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

import { useDeleteTherapy, useTherapies } from '@/hooks/use-therapies'

function TerapiasPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTherapy, setEditingTherapy] = useState<Therapy | undefined>()
  const [deletingTherapy, setDeletingTherapy] = useState<Therapy | null>(null)
  const [managingPricesTherapy, setManagingPricesTherapy] = useState<Therapy | null>(null) // NOVO

  const { data: therapies, isLoading, error } = useTherapies()
  const deleteMutation = useDeleteTherapy()

  const handleEdit = (therapy: Therapy) => {
    setEditingTherapy(therapy)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingTherapy) {
      try {
        await deleteMutation.mutateAsync(deletingTherapy.id)
        setDeletingTherapy(null)
      } catch (error) {
        console.error('Erro ao excluir terapia:', error)
      }
    }
  }

  // NOVO
  const handleManagePrices = (therapy: Therapy) => {
    setManagingPricesTherapy(therapy)
  }

  const handleNewTherapy = () => {
    setEditingTherapy(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTherapy(undefined)
  }

  // Criar as colunas com as ações - ATUALIZADO
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: setDeletingTherapy,
    onManagePrices: handleManagePrices, // NOVO
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
          <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              Erro ao carregar terapias: {error.message}
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
          <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
          <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
        </div>

        <Button onClick={handleNewTherapy}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Terapia
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando terapias...</span>
        </div>
      ) : therapies && therapies.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          Nenhuma terapia cadastrada.
        </div>
      ) : (
        <DataTable columns={columns} data={therapies || []} />
      )}

      {/* Dialog de editar/criar terapia */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTherapy ? 'Editar Terapia' : 'Nova Terapia'}
            </DialogTitle>
            <DialogDescription>
              {editingTherapy
                ? 'Atualize as informações da terapia.'
                : 'Adicione uma nova terapia ao sistema.'}
            </DialogDescription>
          </DialogHeader>

          <TherapyForm
            therapy={editingTherapy}
            onSuccess={handleModalClose}
            onCancel={handleModalClose}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de gerenciar preços - NOVO */}
      <Dialog
        open={!!managingPricesTherapy}
        onOpenChange={() => setManagingPricesTherapy(null)}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Valores</DialogTitle>
            <DialogDescription>
              Configure o histórico de valores da terapia "{managingPricesTherapy?.name}"
            </DialogDescription>
          </DialogHeader>

          {managingPricesTherapy && (
            <TherapyPriceHistoryList
              therapyId={managingPricesTherapy.id}
              therapyName={managingPricesTherapy.name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!deletingTherapy}
        onOpenChange={() => setDeletingTherapy(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a terapia "{deletingTherapy?.name}"?
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

export default function TerapiasPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terapias</h1>
              <p className="text-muted-foreground">Gerencie as terapias do sistema</p>
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
      }
    >
      <TerapiasPageContent />
    </Suspense>
  )
}
```

## Opção 2: Criar Página Separada de Detalhes da Terapia

Crie uma página de detalhes com tabs para informações e histórico de preços.

### 1. Criar `admin/therapies/[id]/page.tsx`

```typescript
'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

import { TherapyForm } from '@/components/therapy-form'
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useTherapy } from '@/hooks/use-therapies'

interface TherapyDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function TherapyDetailsPage({ params }: TherapyDetailsPageProps) {
  const { id } = use(params)
  const { data: therapy, isLoading, error } = useTherapy(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/therapies">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Carregando...</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando terapia...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !therapy) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/therapies">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Erro</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              Terapia não encontrada
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/therapies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{therapy.name}</h1>
          <p className="text-muted-foreground">
            Gerencie as informações e valores da terapia
          </p>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="prices">Histórico de Valores</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Terapia</CardTitle>
              <CardDescription>
                Edite as informações básicas da terapia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TherapyForm therapy={therapy} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <TherapyPriceHistoryList
            therapyId={therapy.id}
            therapyName={therapy.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 2. Atualizar coluna da tabela para link

Em `data-tables/therapies/columns.tsx`, adicione um link no nome:

```typescript
{
  accessorKey: 'name',
  header: 'Nome',
  cell: ({ row }) => (
    <Link href={`/admin/therapies/${row.original.id}`}>
      <div className="font-medium hover:underline cursor-pointer">
        {row.getValue('name')}
      </div>
    </Link>
  ),
}
```

## Opção 3: Adicionar Card Inline na Página Atual

Adicione um card de resumo de preços diretamente na listagem, expandível ao clicar.

### 1. Criar componente de resumo

```typescript
// src/components/therapy-price-summary.tsx
'use client'

import { DollarSign } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useCurrentTherapyPrice } from '@/hooks/use-therapy-price-history'
import { formatCurrency } from '@/services/therapy-price-history-service'

interface TherapyPriceSummaryProps {
  therapyId: string
  onManage: () => void
}

export function TherapyPriceSummary({ therapyId, onManage }: TherapyPriceSummaryProps) {
  const { data: currentPrice, isLoading } = useCurrentTherapyPrice(therapyId)

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Carregando...</div>
  }

  if (!currentPrice) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-yellow-600">
          Sem valor
        </Badge>
        <Button variant="ghost" size="sm" onClick={onManage}>
          <DollarSign className="mr-1 h-3 w-3" />
          Cadastrar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {formatCurrency(currentPrice.value)}
      </span>
      <Badge variant="outline" className="text-xs">
        {currentPrice.competence}
      </Badge>
      <Button variant="ghost" size="sm" onClick={onManage}>
        Gerenciar
      </Button>
    </div>
  )
}
```

### 2. Adicionar coluna na tabela

```typescript
{
  accessorKey: 'currentPrice',
  header: 'Valor Atual',
  cell: ({ row }) => {
    const therapy = row.original
    return (
      <TherapyPriceSummary
        therapyId={therapy.id}
        onManage={() => onManagePrices?.(therapy)}
      />
    )
  },
}
```

## Integração com Sistema de Billing

Para preencher automaticamente o valor em `billing-form.tsx`:

```typescript
import { useTherapyPriceByCompetence } from '@/hooks/use-therapy-price-history'
import { formatCompetence } from '@/services/therapy-price-history-service'

function BillingForm() {
  const form = useForm<BillingFormValues>({
    // ... config
  })

  // Observar mudanças em therapyId e competenceDate
  const therapyId = form.watch('therapyId')
  const competenceDate = form.watch('competenceDate')

  // Formatar competência
  const competence = competenceDate ? formatCompetence(competenceDate) : null

  // Buscar preço
  const { data: therapyPrice, isLoading: isPriceLoading } = useTherapyPriceByCompetence(
    therapyId,
    competence || '',
    !!therapyId && !!competence
  )

  // Auto-preencher valor
  useEffect(() => {
    if (therapyPrice && !form.formState.dirtyFields.sessionValue) {
      form.setValue('sessionValue', therapyPrice.value, {
        shouldValidate: true,
        shouldDirty: false,
      })
    }
  }, [therapyPrice, form])

  return (
    <Form {...form}>
      {/* ... campos do formulário ... */}

      <FormField
        control={form.control}
        name="sessionValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor da Sessão</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  disabled={isPriceLoading}
                />
                {isPriceLoading && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                )}
              </div>
            </FormControl>
            {therapyPrice && (
              <FormDescription>
                Valor sugerido para {therapyPrice.competence}: {formatCurrency(therapyPrice.value)}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

## Resumo

Escolha a opção que melhor se adequa ao seu caso:

1. **Opção 1 (Recomendada)**: Dialog na página atual - mais rápido e simples
2. **Opção 2**: Página separada - melhor UX para gerenciamento detalhado
3. **Opção 3**: Card inline - melhor visibilidade dos valores atuais

Todas as opções usam os mesmos componentes (`TherapyPriceHistoryList` e `TherapyPriceForm`) e hooks, apenas diferindo na forma de apresentação.
