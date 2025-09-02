/**
 * Exemplo atualizado: DataTable com DatePicker customizado
 *
 * Este exemplo demonstra como o componente DataTable agora usa
 * o DatePicker customizado para filtros de data.
 */

import { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/data-tables'

interface Task {
  id: string
  title: string
  status: 'pending' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date
  createdAt: Date
}

const tasks: Task[] = [
  {
    id: '1',
    title: 'Revisar documentação',
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-12-15'),
    createdAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    title: 'Implementar testes',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date('2024-12-10'),
    createdAt: new Date('2024-11-28'),
  },
  // ... mais dados
]

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
    meta: {
      filterType: 'text',
      filterOptions: {
        placeholder: 'Buscar tarefa...',
      },
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
          { value: 'pending', label: 'Pendente' },
          { value: 'completed', label: 'Concluída' },
          { value: 'cancelled', label: 'Cancelada' },
        ],
      },
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusLabels = {
        pending: 'Pendente',
        completed: 'Concluída',
        cancelled: 'Cancelada',
      }

      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      }

      return (
        <span className={`rounded-full px-2 py-1 text-xs ${statusColors[status as keyof typeof statusColors]}`}>
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Prioridade',
    meta: {
      filterType: 'select',
      filterOptions: {
        placeholder: 'Filtrar por prioridade',
        allLabel: 'Todas as prioridades',
        items: [
          { value: 'low', label: 'Baixa' },
          { value: 'medium', label: 'Média' },
          { value: 'high', label: 'Alta' },
        ],
      },
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Data Limite',
    meta: {
      filterType: 'date',
      dateFilterConfig: {
        placeholder: 'Filtrar por data limite',
      },
    },
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as Date
      return new Date(date).toLocaleDateString('pt-BR')
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowDate = new Date(row.getValue(id) as Date)
      const filterDate = new Date(value)
      // Comparar apenas a data (ignorar o horário)
      return (
        rowDate.getFullYear() === filterDate.getFullYear() &&
        rowDate.getMonth() === filterDate.getMonth() &&
        rowDate.getDate() === filterDate.getDate()
      )
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
      const date = row.getValue('createdAt') as Date
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

export default function TasksWithDatePickerExample() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Lista de Tarefas</h1>
      <p className="mb-6 text-gray-600">Exemplo demonstrando o uso do DatePicker customizado nos filtros de data</p>

      <DataTable
        columns={columns}
        data={tasks}
        config={{
          enableColumnFilters: true,
          enableGlobalFilter: true,
          enableUrlPagination: true,
          noResultsText: 'Nenhuma tarefa encontrada.',
          paginationLabels: {
            showing: 'Mostrando',
            of: 'de',
            results: 'tarefas',
            itemsPerPage: 'Tarefas por página:',
            previous: 'Anterior',
            next: 'Próxima',
          },
        }}
      />
    </div>
  )
}

/*
 * ✨ CARACTERÍSTICAS DO DATEPICKER:
 *
 * 1. 📅 Interface Visual Moderna:
 *    - Popover com calendário visual
 *    - Navegação por mês/ano
 *    - Seleção visual de datas
 *
 * 2. 🌐 Localização em Português:
 *    - Nomes dos meses em português
 *    - Formato de data pt-BR
 *    - Placeholders customizáveis
 *
 * 3. 🎯 Integração com Filtros:
 *    - Conversão automática de Date para string
 *    - Filtro por data exata (sem horário)
 *    - Botão de limpar filtro
 *
 * 4. 🔧 Configuração Flexível:
 *    - Placeholder customizável
 *    - Estilos consistentes com o design
 *    - Validação e estados de erro
 *
 * COMO FUNCIONA:
 * - Usuário clica no campo de data
 * - Abre um popover com calendário
 * - Seleciona uma data visualmente
 * - Filtro é aplicado automaticamente
 * - Pode limpar o filtro com o botão X
 */
