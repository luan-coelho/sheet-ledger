# DataTable Genérico

Um componente DataTable reutilizável baseado no TanStack Table v8 e shadcn/ui.

## Características

- ✅ Filtros individuais por coluna nos headers
- ✅ Busca global em todos os campos
- ✅ Filtros específicos por tipo de dados (texto, status, data)
- ✅ Controle de visibilidade de colunas
- ✅ Ordenação por colunas
- ✅ Paginação sincronizada com URL (query params: page, size)
- ✅ Navegação direta para páginas específicas
- ✅ Seletor de itens por página
- ✅ Reset de filtros
- ✅ Tipagem completa em TypeScript
- ✅ Configurações customizáveis

## Uso Básico

```tsx
import { DataTable } from '@/components/generic'

import { createColumns } from './columns'

interface User {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: Date
}

function UsersPage() {
  const users: User[] = [] // seus dados
  const columns = createColumns() // suas colunas

  return <DataTable columns={columns} data={users} />
}
```

## Configuração Personalizada

```tsx
import { DataTable, DataTableConfig } from '@/components/generic'

const customConfig: DataTableConfig = {
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableUrlPagination: true,
  pageSizes: [5, 10, 20, 50, 100],
  initialPageSize: 20,
  maxVisiblePages: 7,
  noResultsText: 'Nenhum item encontrado.',
  paginationLabels: {
    showing: 'Exibindo',
    of: 'de',
    results: 'itens',
    itemsPerPage: 'Itens por página:',
    previous: 'Anterior',
    next: 'Próxima',
  },
}

function ProductsPage() {
  return <DataTable columns={columns} data={products} config={customConfig} />
}
```

## Opções de Configuração

| Propriedade           | Tipo     | Padrão                         | Descrição                          |
| --------------------- | -------- | ------------------------------ | ---------------------------------- |
| `enableGlobalFilter`  | boolean  | true                           | Habilita busca global              |
| `enableColumnFilters` | boolean  | true                           | Habilita filtros por coluna        |
| `enableUrlPagination` | boolean  | true                           | Sincroniza paginação com URL       |
| `pageSizes`           | number[] | [5, 10, 20, 50, 100]           | Tamanhos de página disponíveis     |
| `initialPageSize`     | number   | 10                             | Tamanho inicial da página          |
| `maxVisiblePages`     | number   | 5                              | Máximo de páginas visíveis         |
| `noResultsText`       | string   | "Nenhum resultado encontrado." | Texto quando não há resultados     |
| `paginationLabels`    | object   | -                              | Labels customizados para paginação |

## Criando Colunas

Para criar colunas compatíveis, use o padrão do TanStack Table:

```tsx
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function createColumns(): ColumnDef<YourDataType>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) || false
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('active') as boolean
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true
        if (value === 'active') return row.getValue(id) === true
        if (value === 'inactive') return row.getValue(id) === false
        return true
      },
    },
    // ... mais colunas
  ]
}
```

## Filtros Especiais

O componente reconhece automaticamente alguns tipos de filtros:

- **Campo `active`**: Mostra um select com opções Ativo/Inativo/Todos
- **Campos de data** (`createdAt`, `updatedAt`): Mostra um input de data
- **Campo `actions`**: Não mostra filtro
- **Outros campos**: Mostra input de texto

## Paginação via URL

Quando `enableUrlPagination` está habilitado, a paginação é sincronizada com a URL:

- `?page=1&size=10` (página 1, 10 itens por página)
- `?page=2&size=20` (página 2, 20 itens por página)
- Suporta valores de 1-100 para size
- Navegação mantém estado na URL para compartilhamento

## Exemplos de Uso

### Tabela Simples (sem URL)

```tsx
const simpleConfig: DataTableConfig = {
  enableUrlPagination: false,
  enableGlobalFilter: false,
  initialPageSize: 5,
}

<DataTable columns={columns} data={data} config={simpleConfig} />
```

### Tabela Avançada

```tsx
const advancedConfig: DataTableConfig = {
  enableGlobalFilter: true,
  enableColumnFilters: true,
  enableUrlPagination: true,
  pageSizes: [10, 25, 50, 100],
  initialPageSize: 25,
  maxVisiblePages: 7,
}

<DataTable columns={columns} data={data} config={advancedConfig} />
```

## Integração com APIs

O componente funciona bem com qualquer fonte de dados. Para APIs paginadas, você pode usar o estado da URL para fazer requisições:

```tsx
function DataPage() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const size = parseInt(searchParams.get('size') || '10', 10)

  const { data, isLoading } = useQuery({
    queryKey: ['data', page, size],
    queryFn: () => fetchData({ page, size }),
  })

  if (isLoading) return <div>Carregando...</div>

  return <DataTable columns={columns} data={data || []} />
}
```
