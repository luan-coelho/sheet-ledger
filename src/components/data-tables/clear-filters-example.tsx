/**
 * Exemplo: Todos os filtros com botão X para limpar
 *
 * Este exemplo mostra como todos os tipos de filtros agora possuem
 * o botão X para limpar o filtro selecionado.
 */

import { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-tables'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  category: 'electronics' | 'clothing' | 'books' | 'home'
  status: 'active' | 'inactive' | 'discontinued'
  price: number
  launchDate: Date
  lastUpdated: Date
}

const products: Product[] = [
  {
    id: '1',
    name: 'Smartphone XYZ',
    category: 'electronics',
    status: 'active',
    price: 999.99,
    launchDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-12-01'),
  },
  {
    id: '2',
    name: 'Camiseta Premium',
    category: 'clothing',
    status: 'inactive',
    price: 49.99,
    launchDate: new Date('2024-03-20'),
    lastUpdated: new Date('2024-11-25'),
  },
  // ... mais produtos
]

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Nome do Produto',
    meta: {
      filterType: 'text',
      filterOptions: {
        placeholder: 'Buscar produto...',
      },
    },
    // ✅ Filtro de texto COM botão X
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Selecionar categoria',
        allLabel: 'Todas as categorias',
        items: [
          { value: 'electronics', label: 'Eletrônicos' },
          { value: 'clothing', label: 'Roupas' },
          { value: 'books', label: 'Livros' },
          { value: 'home', label: 'Casa e Jardim' },
        ],
      },
    },
    // ✅ Filtro select COM botão X
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      const categoryLabels = {
        electronics: 'Eletrônicos',
        clothing: 'Roupas',
        books: 'Livros',
        home: 'Casa e Jardim',
      }
      return <Badge variant="outline">{categoryLabels[category as keyof typeof categoryLabels]}</Badge>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Filtrar por status',
        allLabel: 'Todos os status',
        items: [
          { value: 'active', label: 'Ativo' },
          { value: 'inactive', label: 'Inativo' },
          { value: 'discontinued', label: 'Descontinuado' },
        ],
      },
    },
    // ✅ Filtro select COM botão X
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusVariants = {
        active: 'default',
        inactive: 'secondary',
        discontinued: 'destructive',
      } as const

      const statusLabels = {
        active: 'Ativo',
        inactive: 'Inativo',
        discontinued: 'Descontinuado',
      }

      return (
        <Badge variant={statusVariants[status as keyof typeof statusVariants]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'price',
    header: 'Preço',
    meta: {
      filterType: 'text',
      filterOptions: {
        placeholder: 'Filtrar por preço...',
      },
    },
    // ✅ Filtro de texto COM botão X
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price)
    },
  },
  {
    accessorKey: 'launchDate',
    header: 'Data de Lançamento',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por data de lançamento',
      },
    },
    // ✅ Filtro de data COM botão X
    cell: ({ row }) => {
      const date = row.getValue('launchDate') as Date
      return new Date(date).toLocaleDateString('pt-BR')
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowDate = new Date(row.getValue(id) as Date)
      const filterDate = new Date(value)
      return (
        rowDate.getFullYear() === filterDate.getFullYear() &&
        rowDate.getMonth() === filterDate.getMonth() &&
        rowDate.getDate() === filterDate.getDate()
      )
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Última Atualização',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por última atualização',
      },
    },
    // ✅ Filtro de data COM botão X
    cell: ({ row }) => {
      const date = row.getValue('lastUpdated') as Date
      return new Date(date).toLocaleDateString('pt-BR')
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowDate = new Date(row.getValue(id) as Date)
      const filterDate = new Date(value)
      return (
        rowDate.getFullYear() === filterDate.getFullYear() &&
        rowDate.getMonth() === filterDate.getMonth() &&
        rowDate.getDate() === filterDate.getDate()
      )
    },
  },
]

export default function ProductsWithClearFiltersExample() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Catálogo de Produtos</h1>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-blue-800">✨ Novidade: Botão X para Limpar Filtros</h2>
        <div className="space-y-1 text-blue-700">
          <p>
            • <strong>Filtros de Texto:</strong> Digite algo e veja o botão X aparecer
          </p>
          <p>
            • <strong>Filtros Select:</strong> Escolha uma opção e use o X para limpar
          </p>
          <p>
            • <strong>Filtros de Data:</strong> Selecione uma data e limpe com o X
          </p>
          <p>
            • <strong>Experiência Consistente:</strong> Todos os filtros funcionam igual
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        config={{
          enableColumnFilters: true,
          enableGlobalFilter: true,
          enableUrlPagination: true,
          pageSizes: [5, 10, 20],
          initialPageSize: 10,
          noResultsText: 'Nenhum produto encontrado.',
          paginationLabels: {
            showing: 'Mostrando',
            of: 'de',
            results: 'produtos',
            itemsPerPage: 'Produtos por página:',
            previous: 'Anterior',
            next: 'Próxima',
          },
        }}
      />
    </div>
  )
}

/*
 * 🎯 FUNCIONALIDADES DOS BOTÕES X:
 *
 * 1. ✅ FILTRO DE TEXTO:
 *    - Aparece quando há texto digitado
 *    - Remove todo o texto ao clicar
 *    - Volta ao estado inicial
 *
 * 2. ✅ FILTRO SELECT:
 *    - Aparece quando uma opção é selecionada
 *    - Volta para "Todos" ao clicar
 *    - Remove o filtro ativo
 *
 * 3. ✅ FILTRO DE DATA:
 *    - Aparece quando uma data é selecionada
 *    - Remove a data selecionada
 *    - Fecha o DatePicker se estiver aberto
 *
 * 🎨 DESIGN CONSISTENTE:
 * - Mesmo ícone X em todos os filtros
 * - Mesmo tamanho e posicionamento
 * - Mesmo comportamento hover
 * - Acessibilidade com screen readers
 *
 * 🚀 BENEFÍCIOS:
 * - UX mais intuitiva
 * - Feedback visual claro
 * - Facilita limpeza rápida de filtros
 * - Interface profissional
 */
