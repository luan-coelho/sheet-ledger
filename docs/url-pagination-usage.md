# Paginação via URL - DataTable

A implementação de paginação via URL permite que os usuários naveguem diretamente para páginas específicas e compartilhem URLs com estado de paginação.

## Como Funciona

### Query Parameters Suportados

- `page`: Número da página (baseado em 1)
- `size`: Número de itens por página (1-100)

### Exemplos de URLs

```
# Página 1 com 10 itens por página (padrão)
/admin/users

# Página 2 com 10 itens por página
/admin/users?page=2

# Página 1 com 20 itens por página
/admin/users?size=20

# Página 3 com 5 itens por página
/admin/users?page=3&size=5
```

## Funcionalidades Implementadas

### 1. **Sincronização Automática**

- Estado da paginação é automaticamente sincronizado com a URL
- Mudanças na URL atualizam a tabela
- Mudanças na tabela atualizam a URL

### 2. **Controles de Navegação**

#### Botões de Navegação

- ⏮️ **Primeira**: Vai para a primeira página
- ⬅️ **Anterior**: Página anterior
- **Próximo** ➡️: Próxima página
- **Última** ⏭️: Vai para a última página

#### Seletor de Itens por Página

- Dropdown com opções: 5, 10, 20, 50, 100
- Ao alterar, volta automaticamente para a página 1

#### Navegação Direta

- Input numérico para ir diretamente para uma página específica
- Validação automática do range válido
- Pressionar Enter aplica a navegação

### 3. **Validações e Limites**

#### Página

- Mínimo: 1
- Máximo: Última página disponível
- Valor inválido: Mantém página atual

#### Tamanho da Página

- Mínimo: 1 item
- Máximo: 100 itens
- Padrão: 10 itens

### 4. **Comportamentos Especiais**

#### Compartilhamento de URLs

```javascript
// URLs são diretamente compartilháveis
window.location.href = '/admin/users?page=5&size=20'
```

#### Navegação do Browser

- Botões "Voltar" e "Avançar" funcionam corretamente
- Histórico mantém estado da paginação
- Refresh da página mantém posição atual

#### Reset Inteligente

- Alterar filtros reseta para primeira página
- Alterar tamanho da página reseta para primeira página
- Limpar filtros mantém página atual quando possível

## Implementação Técnica

### Hooks Utilizados

```typescript
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
```

### Estado Sincronizado

```typescript
const [pagination, setPagination] = useState<PaginationState>(() => {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const size = parseInt(searchParams.get('size') || '10', 10)

  return {
    pageIndex: Math.max(0, page - 1), // 0-indexed
    pageSize: Math.max(1, Math.min(100, size)),
  }
})
```

### Sincronização com URL

```typescript
const updateURLPagination = useCallback(
  (newPagination: PaginationState) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', (newPagination.pageIndex + 1).toString())
    params.set('size', newPagination.pageSize.toString())

    router.replace(`?${params.toString()}`, { scroll: false })
  },
  [router, searchParams],
)
```

## Performance

### Otimizações Implementadas

- `router.replace()` com `scroll: false` para evitar scroll no topo
- `useCallback` para evitar re-renders desnecessários
- Validação client-side antes de aplicar mudanças
- Debounce implícito através do estado controlado

### Comportamento de Scroll

- Navegação entre páginas não move o scroll
- Usuário mantém posição visual na página
- Ideal para tabelas grandes com muitos filtros

## Casos de Uso

### 1. **Bookmarking**

Usuários podem salvar URLs específicas como favoritos:

```
/admin/users?page=10&size=50
```

### 2. **Compartilhamento**

Links podem ser compartilhados via email, chat, etc.:

```
"Veja os usuários na página 3: /admin/users?page=3&size=20"
```

### 3. **Deep Linking**

Aplicações podem navegar diretamente para estados específicos:

```javascript
router.push('/admin/users?page=5&size=25')
```

### 4. **Relatórios**

URLs podem ser incorporadas em relatórios ou documentação:

```markdown
[Ver usuários ativos - Página 2](/admin/users?page=2&size=50)
```

## Compatibilidade

### Browsers Suportados

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Next.js

- Versão 13+ (App Router)
- Hooks `useRouter` e `useSearchParams`
- Client Components obrigatório

### TanStack Table

- Versão 8.0+
- Hook `useReactTable` com estado controlado
- `PaginationState` interface
