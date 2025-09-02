# Componentes de DataTable

Este diretório contém os componentes de DataTable reutilizáveis do projeto.

## Estrutura

```
components/
├── generic/                 # Componente DataTable genérico
│   ├── data-table.tsx      # Implementação principal
│   ├── index.ts           # Exports
│   └── README.md          # Documentação completa
├── users-table/           # DataTable específico para usuários
│   ├── data-table.tsx     # Wrapper do componente genérico
│   ├── columns.tsx        # Definições de colunas para usuários
│   └── index.ts          # Exports
└── products-table/        # Exemplo de DataTable para produtos
    ├── data-table.tsx     # Wrapper do componente genérico
    ├── columns.tsx        # Definições de colunas para produtos
    ├── example-page.tsx   # Página de exemplo
    └── index.ts          # Exports
```

## Como Usar

### 1. Importar o componente genérico

```tsx
import { DataTable, DataTableConfig } from '@/components/generic'
```

### 2. Criar um wrapper específico (recomendado)

```tsx
// components/my-entity-table/data-table.tsx
import { DataTableConfig, DataTable as GenericDataTable } from '@/components/generic'

const myEntityConfig: DataTableConfig = {
  // suas configurações específicas
}

export function MyEntityDataTable({ columns, data }) {
  return <GenericDataTable columns={columns} data={data} config={myEntityConfig} />
}
```

### 3. Usar em suas páginas

```tsx
import { createMyEntityColumns, MyEntityDataTable } from '@/components/my-entity-table'

function MyPage() {
  const columns = createMyEntityColumns()
  const data = [] // seus dados

  return <MyEntityDataTable columns={columns} data={data} />
}
```

## Benefícios

- ✅ **Reutilizável**: Um componente base para todas as tabelas
- ✅ **Configurável**: Cada tabela pode ter suas próprias configurações
- ✅ **Consistente**: Todas as tabelas seguem o mesmo padrão
- ✅ **Manutenível**: Mudanças no componente base afetam todas as tabelas
- ✅ **Tipado**: TypeScript completo em todos os componentes
- ✅ **Performático**: Baseado no TanStack Table v8

## Próximos Passos

Para criar uma nova tabela:

1. Copie a estrutura de `products-table/` como template
2. Adapte as interfaces e colunas para sua entidade
3. Configure os labels e comportamentos específicos
4. Implemente as ações necessárias (editar, excluir, etc.)

Consulte o `README.md` em `components/generic/` para documentação completa.
