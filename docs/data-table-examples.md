# DataTable - Exemplos de Uso

Este documento mostra como usar o componente DataTable genérico de forma configurável para diferentes domínios.

## Exemplo Básico

```typescript
import { DataTable } from '@/components/data-tables/data-table'
import { ColumnDef } from '@tanstack/react-table'

interface Product {
  id: string
  name: string
  price: number
  category: string
  status: 'active' | 'inactive'
  createdAt: string
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Nome do Produto',
  },
  {
    accessorKey: 'price',
    header: 'Preço',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price)
      return formatted
    },
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
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
          { value: 'inactive', label: 'Inativo' }
        ]
      }
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por data de criação'
      }
    }
  }
]

function ProductsPage() {
  const products: Product[] = [] // seus dados aqui

  return (
    <DataTable
      columns={columns}
      data={products}
      config={{
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableUrlPagination: true,
        pageSizes: [10, 20, 50],
        initialPageSize: 20,
        noResultsText: 'Nenhum produto encontrado.',
        paginationLabels: {
          showing: 'Mostrando',
          of: 'de',
          results: 'produtos',
          itemsPerPage: 'Produtos por página:',
          previous: 'Anterior',
          next: 'Próxima',
        }
      }}
    />
  )
}
```

## Exemplo para Usuários

```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  active: boolean
  lastLogin: string
}

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    meta: {
      filterOptions: {
        placeholder: 'Buscar por nome...'
      }
    }
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
    meta: {
      filterOptions: {
        placeholder: 'Buscar por e-mail...'
      }
    }
  },
  {
    accessorKey: 'role',
    header: 'Função',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Filtrar por função',
        allLabel: 'Todas as funções',
        items: [
          { value: 'admin', label: 'Administrador' },
          { value: 'user', label: 'Usuário' },
          { value: 'moderator', label: 'Moderador' }
        ]
      }
    }
  },
  {
    accessorKey: 'active',
    header: 'Status',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Filtrar por status',
        allLabel: 'Todos os status',
        items: [
          { value: 'true', label: 'Ativo' },
          { value: 'false', label: 'Inativo' }
        ]
      }
    },
    cell: ({ row }) => {
      const isActive = row.getValue('active')
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  },
  {
    accessorKey: 'lastLogin',
    header: 'Último Login',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por último login'
      }
    }
  }
]

function UsersPage() {
  const users: User[] = [] // seus dados aqui

  return (
    <DataTable
      columns={userColumns}
      data={users}
      config={{
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableUrlPagination: true,
        enableUrlSorting: true,
        pageSizes: [5, 10, 25, 50],
        initialPageSize: 10,
        noResultsText: 'Nenhum usuário encontrado.',
        paginationLabels: {
          showing: 'Mostrando',
          of: 'de',
          results: 'usuários',
          itemsPerPage: 'Usuários por página:',
          previous: 'Anterior',
          next: 'Próxima',
        }
      }}
    />
  )
}
```

## Configurações Disponíveis

### DataTableConfig

```typescript
interface DataTableConfig {
  /** Habilitar/desabilitar busca global */
  enableGlobalFilter?: boolean

  /** Habilitar/desabilitar filtros por coluna */
  enableColumnFilters?: boolean

  /** Habilitar/desabilitar paginação via URL */
  enableUrlPagination?: boolean

  /** Habilitar/desabilitar ordenação via URL */
  enableUrlSorting?: boolean

  /** Tamanhos de página disponíveis */
  pageSizes?: number[]

  /** Tamanho inicial da página */
  initialPageSize?: number

  /** Máximo de páginas visíveis na navegação */
  maxVisiblePages?: number

  /** Texto customizado para "nenhum resultado" */
  noResultsText?: string

  /** Texto customizado para informações de paginação */
  paginationLabels?: {
    showing?: string
    of?: string
    results?: string
    itemsPerPage?: string
    previous?: string
    next?: string
  }
}
```

### Meta da Coluna (ColumnMeta)

```typescript
interface ColumnMeta {
  /** Tipo de filtro para a coluna */
  filterType?: 'select' | 'date' | 'text'

  /** Configurações para filtro do tipo select */
  filterOptions?: {
    placeholder?: string
    allLabel?: string
    items: Array<{ value: string; label: string }>
  }

  /** Configurações para filtro do tipo date */
  dateFilterConfig?: {
    placeholder?: string
  }
}
```

## Dicas de Uso

1. **Filtros Customizados**: Use a propriedade `meta` nas colunas para configurar filtros específicos
2. **Placeholders**: Configure placeholders específicos para cada tipo de dado
3. **Labels de Paginação**: Customize os textos da paginação para o domínio específico
4. **Sem Resultados**: Configure mensagem específica quando não há dados
5. **URL Persistence**: A paginação e ordenação são automaticamente sincronizadas com a URL
6. **Performance**: O componente é otimizado para grandes volumes de dados
7. **Responsivo**: A interface se adapta automaticamente a diferentes tamanhos de tela
