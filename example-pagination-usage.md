# Exemplo de uso do hook usePagination com query param "size"

## Como usar

O hook `usePagination` agora suporta a query param "size" para definir o número de itens por página.

### URL com size personalizado:

```
/admin/users?size=50
/admin/users?size=10&page=2
```

### No componente:

```tsx
const pagination = usePagination({
  itemsPerPage: 25, // valor padrão se não houver query param "size"
  totalItems: filteredUsers.length,
})

// Para alterar programaticamente o tamanho da página:
pagination.setItemsPerPage(50) // Isso irá atualizar a URL para ?size=50
```

### Validações implementadas:

- O valor deve ser um número positivo
- O valor deve estar entre 1 e 100
- Se o valor for inválido, usa o padrão fornecido
- Quando o tamanho da página muda, retorna automaticamente para a página 1

### Exemplo de seletor de tamanho de página:

```tsx
<select value={pagination.itemsPerPage} onChange={e => pagination.setItemsPerPage(parseInt(e.target.value))}>
  <option value="10">10 por página</option>
  <option value="25">25 por página</option>
  <option value="50">50 por página</option>
  <option value="100">100 por página</option>
</select>
```
