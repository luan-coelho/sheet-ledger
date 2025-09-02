# Como Implementar Filtro Select para Status Ativo/Inativo

## Exemplo Prático

```typescript
import { DataTable } from '@/components/data-tables'
import { ColumnDef } from '@tanstack/react-table'

interface Item {
  id: string
  name: string
  active: boolean
}

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
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
      const isActive = row.getValue('active') as boolean
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    // Função de filtro para campos boolean
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as boolean
      return cellValue.toString() === value
    }
  }
]

function MyPage() {
  const data = [
    { id: '1', name: 'Item 1', active: true },
    { id: '2', name: 'Item 2', active: false },
    // ... mais dados
  ]

  return (
    <DataTable columns={columns} data={data} />
  )
}
```

## Explicação

1. **Configuração do Filtro**: Use `filterType: 'select'` na propriedade `meta` da coluna
2. **Opções do Select**: Configure `filterOptions` com os valores `'true'` e `'false'` como strings
3. **Função de Filtro**: Para campos boolean, adicione `filterFn` para converter o valor da célula para string antes da comparação
4. **Renderização**: Use `cell` para personalizar como o status é exibido (badge, cor, etc.)

## Tipos de Status Suportados

### Para Boolean (true/false)

```typescript
items: [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
]
```

### Para String ('active'/'inactive')

```typescript
items: [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
]
```

### Para Enum/Union Types

```typescript
items: [
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'archived', label: 'Arquivado' },
]
```
