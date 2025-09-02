# Componentes de Paginação e Busca

## Visão Geral

Este documento descreve como usar os componentes reutilizáveis de paginação e busca que foram implementados para melhorar a experiência do usuário e a manutenibilidade do código.

## Hooks Disponíveis

### `usePagination`

Hook para gerenciar paginação com URL state.

```typescript
import { usePagination } from '@/hooks/use-pagination'

const pagination = usePagination({
  itemsPerPage: 10, // Opcional, padrão: 10
  totalItems: filteredData.length,
})

// Propriedades disponíveis:
// - currentPage: número da página atual
// - totalPages: total de páginas
// - itemsPerPage: itens por página
// - startIndex: índice de início para slice
// - endIndex: índice de fim para slice
// - hasNextPage: boolean se há próxima página
// - hasPreviousPage: boolean se há página anterior
// - setPage: função para ir para página específica
// - nextPage: função para próxima página
// - previousPage: função para página anterior
// - goToFirstPage: função para primeira página
// - goToLastPage: função para última página
// - getVisiblePages: função que retorna array de páginas visíveis
```

### `useSearchFilter`

Hook para gerenciar filtros de busca com URL state.

```typescript
import { useSearchFilter } from '@/hooks/use-search-filter'

const { searchFilter, setSearchFilter, clearSearchFilter } = useSearchFilter({
  paramName: 'search', // Opcional, padrão: 'search'
  resetPagination: true, // Opcional, padrão: true
})
```

## Componentes Disponíveis

### `SearchBar`

Componente de barra de busca reutilizável.

```typescript
import { SearchBar } from '@/components/search-bar'

<SearchBar
  value={searchFilter}
  onChange={setSearchFilter}
  onClear={clearSearchFilter}
  placeholder="Buscar por nome..." // Opcional
  className="max-w-sm" // Opcional
/>
```

### `PaginationControls`

Componente de controles de paginação reutilizável.

```typescript
import { PaginationControls } from '@/components/pagination-controls'

<PaginationControls
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  totalItems={filteredData.length}
  itemsPerPage={pagination.itemsPerPage}
  startIndex={pagination.startIndex}
  endIndex={pagination.endIndex}
  hasNextPage={pagination.hasNextPage}
  hasPreviousPage={pagination.hasPreviousPage}
  visiblePages={pagination.getVisiblePages()}
  onPageChange={pagination.setPage}
  onFirstPage={pagination.goToFirstPage}
  onLastPage={pagination.goToLastPage}
  onNextPage={pagination.nextPage}
  onPreviousPage={pagination.previousPage}
  showItemsPerPage={false} // Opcional
  itemsPerPageOptions={[10, 20, 50, 100]} // Opcional
  onItemsPerPageChange={handleItemsPerPageChange} // Opcional
/>
```

## Exemplo Completo

```typescript
'use client'

import { Suspense, useMemo } from 'react'
import { SearchBar } from '@/components/search-bar'
import { PaginationControls } from '@/components/pagination-controls'
import { usePagination } from '@/hooks/use-pagination'
import { useSearchFilter } from '@/hooks/use-search-filter'

function MyPageContent() {
  const { data, isLoading } = useMyData()

  // Hook para filtro de busca
  const { searchFilter, setSearchFilter, clearSearchFilter } = useSearchFilter()

  // Filtrar dados
  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter(item =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    )
  }, [data, searchFilter])

  // Hook para paginação
  const pagination = usePagination({
    itemsPerPage: 10,
    totalItems: filteredData.length
  })

  // Dados da página atual
  const paginatedData = useMemo(() => {
    return filteredData.slice(pagination.startIndex, pagination.endIndex)
  }, [filteredData, pagination.startIndex, pagination.endIndex])

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      {/* Barra de busca */}
      <SearchBar
        value={searchFilter}
        onChange={setSearchFilter}
        onClear={clearSearchFilter}
        placeholder="Buscar..."
      />

      {/* Lista de dados */}
      <div>
        {paginatedData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      {/* Controles de paginação */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={filteredData.length}
        itemsPerPage={pagination.itemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        visiblePages={pagination.getVisiblePages()}
        onPageChange={pagination.setPage}
        onFirstPage={pagination.goToFirstPage}
        onLastPage={pagination.goToLastPage}
        onNextPage={pagination.nextPage}
        onPreviousPage={pagination.previousPage}
      />
    </div>
  )
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MyPageContent />
    </Suspense>
  )
}
```

## Vantagens

1. **URL State**: A paginação e busca são sincronizadas com a URL, permitindo compartilhamento de links e navegação do browser
2. **Reutilizável**: Componentes e hooks podem ser usados em qualquer página
3. **Type-safe**: Totalmente tipado com TypeScript
4. **Responsivo**: Componentes adaptam-se a diferentes tamanhos de tela
5. **Acessível**: Componentes seguem as melhores práticas de acessibilidade
6. **Performance**: Uso de useMemo para otimização de renderização

## Migração

Para migrar páginas existentes:

1. Substitua estados locais pelos hooks `usePagination` e `useSearchFilter`
2. Substitua a UI de paginação pelo componente `PaginationControls`
3. Substitua a barra de busca pelo componente `SearchBar`
4. Envolva o componente principal em `Suspense` se usar `useSearchParams`
5. Use `useMemo` para otimizar a filtragem e paginação de dados
