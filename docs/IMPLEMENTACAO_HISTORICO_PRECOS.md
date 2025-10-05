# Implementação do Histórico de Preços de Terapias

## Resumo da Implementação

Foi implementado um sistema completo de histórico de valores de terapias por competência (mês/ano), permitindo rastrear mudanças de preço ao longo do tempo e consultar valores históricos.

## O que foi implementado

### 1. Schema do Banco de Dados

**Arquivo:** `src/app/db/schemas/therapy-price-history-schema.ts`

- Nova tabela `therapy_price_history` com:
  - `id`: UUID (PK)
  - `therapy_id`: UUID (FK para therapies)
  - `competence`: TEXT (formato YYYY-MM)
  - `value_cents`: INTEGER (valor em centavos)
  - `created_at`, `updated_at`: TIMESTAMP
  - **Constraint único**: `(therapy_id, competence)` para evitar duplicatas

- Schemas Zod para validação:
  - `insertTherapyPriceHistorySchema`: Criar novo valor
  - `updateTherapyPriceHistorySchema`: Atualizar valor existente
  - `getTherapyPriceByCompetenceSchema`: Buscar por competência
  - `listTherapyPricesSchema`: Listar com filtros

- Validações incluídas:
  - Formato YYYY-MM correto
  - Data válida (ano e mês existentes)
  - Valor positivo (máximo 999999)

### 2. Migrations

**Arquivos gerados:**

- `drizzle/0000_closed_roland_deschain.sql`: Migration inicial com todas as tabelas
- `drizzle/0001_huge_doomsday.sql`: Adiciona constraint único

Para aplicar:

```bash
pnpm drizzle-kit push
```

### 3. API Endpoints

**Arquivo base:** `src/app/api/therapy-price-history/`

#### GET /api/therapy-price-history

Lista histórico de preços com filtros opcionais.

**Query params:**

- `therapyId` (obrigatório)
- `startCompetence` (opcional)
- `endCompetence` (opcional)

**Resposta:** Array de valores ordenados por competência (mais recente primeiro)

#### POST /api/therapy-price-history

Cria novo valor para uma competência.

**Body:**

```json
{
  "therapyId": "uuid",
  "competence": "2025-01",
  "value": 150
}
```

**Validações:**

- Terapia deve existir
- Não pode haver duplicata de therapy_id + competence
- Valor deve ser positivo

#### GET /api/therapy-price-history/[id]

Busca um registro específico por ID.

#### PUT /api/therapy-price-history/[id]

Atualiza um registro existente.

**Observação:** A competência pode ser alterada, mas não pode gerar duplicata.

#### DELETE /api/therapy-price-history/[id]

Deleta um registro.

#### GET /api/therapy-price-history/by-competence

**Endpoint especial** para buscar valor de terapia em uma competência.

**Query params:**

- `therapyId` (obrigatório)
- `competence` (obrigatório)

**Lógica de busca:**

1. Busca valor exato para a competência
2. Se não encontrar, busca o valor mais recente **anterior ou igual**
3. Retorna 404 se não houver valores até aquela competência

**Exemplo:**

- Valores cadastrados: 2025-01 (R$ 150), 2025-03 (R$ 170)
- Consulta 2025-02 → Retorna R$ 150 (valor anterior)
- Consulta 2025-04 → Retorna R$ 170 (valor mais recente)
- Consulta 2024-12 → Erro 404 (sem valores anteriores)

### 4. Serviços (Service Layer)

**Arquivo:** `src/services/therapy-price-history-service.ts`

Funções principais:

- `listTherapyPriceHistory()`: Lista histórico
- `getTherapyPriceHistoryById()`: Busca por ID
- `getTherapyPriceByCompetence()`: Busca por competência
- `createTherapyPriceHistory()`: Cria novo
- `updateTherapyPriceHistory()`: Atualiza
- `deleteTherapyPriceHistory()`: Deleta

Funções auxiliares:

- `formatCompetence(date)`: Converte Date/string para YYYY-MM
- `formatCurrency(value)`: Formata R$ 150,00
- `competenceToDate(competence)`: Converte YYYY-MM para Date
- `isValidCompetence(competence)`: Valida formato

### 5. Hooks React Query

**Arquivo:** `src/hooks/use-therapy-price-history.ts`

Hooks implementados:

#### useTherapyPriceHistory

Lista histórico de preços de uma terapia.

```typescript
const { data, isLoading } = useTherapyPriceHistory(
  therapyId,
  startCompetence?, // opcional
  endCompetence?    // opcional
)
```

#### useTherapyPriceByCompetence

Busca valor para competência específica (com fallback para valor anterior).

```typescript
const { data, isLoading, isError } = useTherapyPriceByCompetence(therapyId, competence)
```

#### useCreateTherapyPriceHistory

Cria novo valor (com toast de sucesso/erro).

```typescript
const createMutation = useCreateTherapyPriceHistory()
await createMutation.mutateAsync({ therapyId, competence, value })
```

#### useUpdateTherapyPriceHistory

Atualiza valor existente.

```typescript
const updateMutation = useUpdateTherapyPriceHistory()
await updateMutation.mutateAsync({ id, data: { value: 180 } })
```

#### useDeleteTherapyPriceHistory

Deleta valor.

```typescript
const deleteMutation = useDeleteTherapyPriceHistory()
await deleteMutation.mutateAsync(id)
```

#### useCurrentTherapyPrice

Retorna o valor mais recente cadastrado.

```typescript
const { data: currentPrice } = useCurrentTherapyPrice(therapyId)
```

#### useTherapyPriceHistoryByYear

Retorna histórico agrupado por ano.

```typescript
const { data: byYear } = useTherapyPriceHistoryByYear(therapyId)
// Retorna: [{ year: "2025", items: [...] }, ...]
```

**Características:**

- Invalidação automática de cache ao criar/atualizar/deletar
- Toasts de feedback automáticos (sonner)
- Query keys organizadas para facilitar invalidação

### 6. Componentes React

#### TherapyPriceForm

**Arquivo:** `src/components/therapy-price-form.tsx`

Formulário para criar/editar valores de terapia.

**Props:**

```typescript
interface TherapyPriceFormProps {
  therapyId: string
  priceHistory?: TherapyPriceHistoryWithFormatted // para edição
  onSuccess?: () => void
  onCancel?: () => void
}
```

**Características:**

- Seletor de data com calendário (apenas mês/ano)
- Input numérico para valor em reais
- Validação em tempo real com Zod
- Competência desabilitada ao editar (não pode ser alterada)
- Loading states

#### TherapyPriceHistoryList

**Arquivo:** `src/components/therapy-price-history-list.tsx`

Lista completa de histórico com ações de CRUD.

**Props:**

```typescript
interface TherapyPriceHistoryListProps {
  therapyId: string
  therapyName?: string
}
```

**Características:**

- Tabela com histórico ordenado por competência
- Exibe valor formatado em reais
- Cálculo e exibição de variação percentual entre valores
- Badge "Atual" para o mês corrente
- Ícones de tendência (↑ para aumento, ↓ para redução)
- Botões de editar e deletar por linha
- Dialog para adicionar novo valor
- Dialog para editar valor existente
- Alert dialog para confirmar exclusão
- Estado vazio com mensagem amigável

### 7. Documentação

#### THERAPY_PRICE_HISTORY.md

**Arquivo:** `docs/THERAPY_PRICE_HISTORY.md`

Documentação completa contendo:

- Visão geral do sistema
- Conceitos principais (competência, busca de valores)
- Estrutura do banco de dados
- Detalhes de todos os endpoints da API
- Exemplos de uso de todos os hooks
- Exemplos de uso dos componentes
- Casos de uso práticos
- Guia de troubleshooting
- Integração com sistema de billing
- Próximos passos

## Como usar

### 1. Aplicar migrations

```bash
pnpm drizzle-kit push
```

### 2. Usar em uma página

```typescript
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list'

function TherapyDetailsPage({ therapyId }: Props) {
  return (
    <div>
      <h1>Detalhes da Terapia</h1>
      <TherapyPriceHistoryList
        therapyId={therapyId}
        therapyName="Psicologia"
      />
    </div>
  )
}
```

### 3. Buscar valor em faturamento

```typescript
import { useTherapyPriceByCompetence } from '@/hooks/use-therapy-price-history'

import { formatCompetence } from '@/services/therapy-price-history-service'

function BillingForm() {
  const competence = formatCompetence(billingDate)
  const { data: price } = useTherapyPriceByCompetence(therapyId, competence)

  // Usar price.value no formulário
  useEffect(() => {
    if (price) {
      form.setValue('sessionValue', price.value)
    }
  }, [price])
}
```

## Fluxo de dados

```
┌─────────────────────────────────────────────────────────────┐
│                      Componente React                       │
│                                                             │
│  TherapyPriceHistoryList / TherapyPriceForm                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ usa
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Query Hooks                        │
│                                                             │
│  useTherapyPriceHistory, useCreateTherapyPriceHistory, etc │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ chama
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Service Functions (TS)                      │
│                                                             │
│  listTherapyPriceHistory, createTherapyPriceHistory, etc   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ fetch
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes                              │
│                                                             │
│  /api/therapy-price-history, /by-competence, /[id]        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ valida (Zod) e consulta
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Database (PostgreSQL)                        │
│                                                             │
│            therapy_price_history table                      │
└─────────────────────────────────────────────────────────────┘
```

## Exemplo de uso completo

### Caso: Cliente fez terapia em 01/2025 por R$ 150, em 03/2025 passou a R$ 170

1. **Cadastrar valor inicial:**

```typescript
await createMutation.mutateAsync({
  therapyId: 'therapy-123',
  competence: '2025-01',
  value: 150,
})
```

2. **Cadastrar novo valor:**

```typescript
await createMutation.mutateAsync({
  therapyId: 'therapy-123',
  competence: '2025-03',
  value: 170,
})
```

3. **Consultar valor para faturamento de 01/2025:**

```typescript
const { data } = useTherapyPriceByCompetence('therapy-123', '2025-01')
// Retorna: { value: 150, competence: '2025-01', ... }
```

4. **Consultar valor para faturamento de 02/2025:**

```typescript
const { data } = useTherapyPriceByCompetence('therapy-123', '2025-02')
// Retorna: { value: 150, competence: '2025-01', ... }
// Nota: Retorna o valor de 01/2025 pois não há valor específico para 02/2025
```

5. **Consultar valor para faturamento de 03/2025:**

```typescript
const { data } = useTherapyPriceByCompetence('therapy-123', '2025-03')
// Retorna: { value: 170, competence: '2025-03', ... }
```

## Arquitetura de dados

### Valores em centavos

Os valores são armazenados em centavos no banco para evitar problemas de precisão com ponto flutuante:

- Banco: `value_cents: 15000` (INTEGER)
- API: converte para/de reais automaticamente
- Frontend: trabalha com valores decimais normais (150.00)

### Índice único composto

A constraint `unique_therapy_competence` garante:

- Uma terapia pode ter múltiplos valores
- Mas apenas UM valor por competência
- Previne duplicatas acidentais
- Erro 409 ao tentar criar duplicata

### Cascade delete

Quando uma terapia é deletada:

- Todos os valores relacionados são deletados automaticamente
- `ON DELETE CASCADE` na foreign key

## Testes recomendados

### Testes unitários necessários:

1. Validação de formato de competência
2. Conversão entre centavos e reais
3. Busca de valor por competência (casos exato e anterior)
4. Formatação de datas e valores

### Testes de integração necessários:

1. CRUD completo via API
2. Constraint de unicidade (therapy_id + competence)
3. Cascade delete ao deletar terapia
4. Busca com fallback para valor anterior

### Testes E2E necessários:

1. Fluxo completo: criar terapia → adicionar valores → consultar
2. Edição de valores no histórico
3. Validação de erros no formulário
4. Confirmação de exclusão

## Melhorias futuras

1. **Validação de referências**: Impedir exclusão de valores usados em billings
2. **Relatórios**: Gráfico de evolução de preços
3. **Exportação**: Excel/CSV do histórico
4. **Import em massa**: Upload de CSV com múltiplos valores
5. **Alertas**: Notificar quando valores estiverem desatualizados
6. **Auditoria**: Registrar quem criou/alterou cada valor
7. **Previsão**: Sugerir reajustes baseados em histórico
8. **Comparação**: Comparar preços entre terapias diferentes

## Integração com Billing

Para integrar com o sistema de faturamento existente, adicione ao `billing-form.tsx`:

```typescript
// Buscar valor automaticamente quando terapia e competência forem selecionados
const competence = form.watch('competenceDate') ? formatCompetence(form.watch('competenceDate')) : null

const { data: therapyPrice } = useTherapyPriceByCompetence(
  form.watch('therapyId'),
  competence,
  !!form.watch('therapyId') && !!competence,
)

// Preencher campo de valor automaticamente
useEffect(() => {
  if (therapyPrice && !form.formState.isDirty) {
    form.setValue('sessionValue', therapyPrice.value)
  }
}, [therapyPrice])
```

## Conclusão

O sistema de histórico de preços está completo e pronto para uso. Ele fornece:

- ✅ Backend robusto com validações
- ✅ API RESTful completa
- ✅ Hooks React Query com cache e invalidação
- ✅ Componentes UI prontos para uso
- ✅ Documentação detalhada
- ✅ Busca inteligente com fallback
- ✅ Prevenção de duplicatas
- ✅ Histórico completo por competência

Para começar, basta aplicar as migrations e usar os componentes nas páginas desejadas.
