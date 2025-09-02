/**
 * Exemplo simples: Filtro Select para Status Ativo/Inativo
 *
 * Este exemplo mostra como adicionar um filtro dropdown para selecionar
 * entre registros ativos e inativos em uma tabela.
 */

import { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-tables'

// Dados de exemplo
interface User {
  id: string
  name: string
  email: string
  active: boolean
}

const users: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', active: true },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', active: false },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', active: true },
  { id: '4', name: 'Ana Lima', email: 'ana@email.com', active: false },
]

// Configuração das colunas
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'active',
    header: 'Status',
    // 🎯 CONFIGURAÇÃO DO FILTRO SELECT PARA ATIVO/INATIVO
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Filtrar por status',
        allLabel: 'Todos',
        items: [
          { value: 'true', label: 'Ativo' },
          { value: 'false', label: 'Inativo' },
        ],
      },
    },
    // Renderização personalizada do status
    cell: ({ row }) => {
      const isActive = row.getValue('active') as boolean
      return (
        <div className="flex items-center">
          <div className={`mr-2 h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isActive ? 'Ativo' : 'Inativo'}</span>
        </div>
      )
    },
    // Função de filtro para campos boolean
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as boolean
      return cellValue.toString() === value
    },
  },
]

// Componente da página
export default function UsersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Lista de Usuários</h1>

      <DataTable
        columns={columns}
        data={users}
        config={{
          enableColumnFilters: true,
          noResultsText: 'Nenhum usuário encontrado.',
        }}
      />
    </div>
  )
}

/*
 * 🔍 COMO FUNCIONA:
 *
 * 1. Na coluna 'active', adicione a configuração meta:
 *    - filterType: 'select' - Define que será um dropdown
 *    - filterOptions.items - Define as opções do dropdown
 *    - Para boolean, use 'true'/'false' como values
 *
 * 2. A função filterFn converte o valor boolean para string
 *    para comparar com o valor selecionado no dropdown
 *
 * 3. O usuário verá um dropdown com as opções:
 *    - "Todos" (mostra todos os registros)
 *    - "Ativo" (mostra apenas active: true)
 *    - "Inativo" (mostra apenas active: false)
 *
 * ✨ RESULTADO:
 * - Dropdown aparece no header da coluna Status
 * - Usuário pode filtrar por Ativo, Inativo ou Todos
 * - Filtro é aplicado automaticamente ao selecionar
 * - Interface limpa e intuitiva
 */
