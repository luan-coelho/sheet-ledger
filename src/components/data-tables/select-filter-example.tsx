/**
 * Exemplo prático de uso do DataTable com filtro select para status ativo/inativo
 */

import { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-tables'
import { Badge } from '@/components/ui/badge'

// Interface de exemplo para um usuário
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  active: boolean
  lastLogin: string
  createdAt: string
}

// Dados de exemplo
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'admin',
    active: true,
    lastLogin: '2024-12-01',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    role: 'user',
    active: false,
    lastLogin: '2024-11-20',
    createdAt: '2024-02-10',
  },
  // ... mais dados
]

// Definição das colunas com filtros select
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'role',
    header: 'Função',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Selecionar função',
        allLabel: 'Todas as funções',
        items: [
          { value: 'admin', label: 'Administrador' },
          { value: 'user', label: 'Usuário' },
          { value: 'moderator', label: 'Moderador' },
        ],
      },
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      const roleLabels = {
        admin: 'Administrador',
        user: 'Usuário',
        moderator: 'Moderador',
      }

      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          {roleLabels[role as keyof typeof roleLabels]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'active',
    header: 'Status',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Selecionar status',
        allLabel: 'Todos os status',
        items: [
          { value: 'true', label: 'Ativo' },
          { value: 'false', label: 'Inativo' },
        ],
      },
    },
    cell: ({ row }) => {
      const isActive = row.getValue('active') as boolean

      return <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
    },
    // Função de filtro customizada para boolean
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as boolean
      return cellValue.toString() === value
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Último Login',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por último login',
      },
    },
    cell: ({ row }) => {
      const date = row.getValue('lastLogin') as string
      return new Date(date).toLocaleDateString('pt-BR')
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por data de criação',
      },
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return new Date(date).toLocaleDateString('pt-BR')
    },
  },
]

// Componente de exemplo
export default function UsersTableExample() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold">Exemplo: Tabela de Usuários</h1>

      <DataTable
        columns={userColumns}
        data={sampleUsers}
        config={{
          enableGlobalFilter: true,
          enableColumnFilters: true,
          enableUrlPagination: true,
          enableUrlSorting: true,
          pageSizes: [5, 10, 20, 50],
          initialPageSize: 10,
          noResultsText: 'Nenhum usuário encontrado.',
          paginationLabels: {
            showing: 'Mostrando',
            of: 'de',
            results: 'usuários',
            itemsPerPage: 'Usuários por página:',
            previous: 'Anterior',
            next: 'Próxima',
          },
        }}
      />
    </div>
  )
}

/*
 * COMO USAR FILTROS SELECT:
 *
 * 1. Para campos de texto simples (string):
 *    meta: {
 *      filterType: 'select',
 *      filterOptions: {
 *        placeholder: 'Selecionar opção',
 *        allLabel: 'Todas as opções',
 *        items: [
 *          { value: 'opcao1', label: 'Opção 1' },
 *          { value: 'opcao2', label: 'Opção 2' }
 *        ]
 *      }
 *    }
 *
 * 2. Para campos boolean (true/false):
 *    meta: {
 *      filterType: 'select',
 *      filterOptions: {
 *        placeholder: 'Selecionar status',
 *        allLabel: 'Todos',
 *        items: [
 *          { value: 'true', label: 'Ativo' },
 *          { value: 'false', label: 'Inativo' }
 *        ]
 *      }
 *    },
 *    filterFn: (row, id, value) => {
 *      const cellValue = row.getValue(id) as boolean
 *      return cellValue.toString() === value
 *    }
 *
 * 3. Para campos enum/union types:
 *    meta: {
 *      filterType: 'select',
 *      filterOptions: {
 *        placeholder: 'Selecionar categoria',
 *        allLabel: 'Todas as categorias',
 *        items: [
 *          { value: 'categoria_a', label: 'Categoria A' },
 *          { value: 'categoria_b', label: 'Categoria B' },
 *          { value: 'categoria_c', label: 'Categoria C' }
 *        ]
 *      }
 *    }
 */
