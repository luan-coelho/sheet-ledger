# Sistema de Histórico de Preços de Terapias

## Visão Geral

O sistema de histórico de preços de terapias permite registrar e consultar valores de terapias ao longo do tempo, organizados por competência (mês/ano). Isso possibilita:

- Rastrear mudanças de preço ao longo do tempo
- Consultar o valor correto de uma terapia para uma competência específica
- Manter histórico completo de valores para fins de auditoria e relatórios
- Buscar automaticamente o valor aplicável a uma data específica

## Conceitos Principais

### Competência

A competência é representada no formato `YYYY-MM` (ex: `2025-01`, `2025-03`). Cada competência representa um mês específico, e para cada terapia pode existir apenas um valor por competência.

### Busca de Valores

Quando você busca o valor de uma terapia para uma competência específica:

1. **Correspondência Exata**: Se existir um valor cadastrado exatamente para aquela competência, ele será retornado.
2. **Valor Anterior**: Se não houver valor exato, o sistema retorna o valor mais recente cadastrado **antes ou igual** à competência solicitada.

#### Exemplo Prático

Se uma terapia possui os seguintes valores cadastrados:

- `2025-01`: R$ 150,00
- `2025-03`: R$ 170,00

Ao consultar valores:

- **2025-01** → Retorna R$ 150,00 (correspondência exata)
- **2025-02** → Retorna R$ 150,00 (valor mais recente anterior)
- **2025-03** → Retorna R$ 170,00 (correspondência exata)
- **2025-04** → Retorna R$ 170,00 (valor mais recente)
- **2024-12** → Erro: não há valores cadastrados até esta data

## Estrutura do Banco de Dados

### Tabela: `therapy_price_history`

```sql
CREATE TABLE "therapy_price_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "therapy_id" uuid NOT NULL REFERENCES "therapies"("id") ON DELETE CASCADE,
  "competence" text NOT NULL,
  "value_cents" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unique_therapy_competence" UNIQUE("therapy_id", "competence")
);
```

**Características:**

- `therapy_id`: Referência à terapia
- `competence`: Mês/ano no formato YYYY-MM
- `value_cents`: Valor armazenado em centavos (ex: 15000 = R$ 150,00)
- Índice único composto em `(therapy_id, competence)` impede duplicatas

## API Endpoints

### 1. Listar Histórico de Preços

```http
GET /api/therapy-price-history?therapyId={uuid}&startCompetence={YYYY-MM}&endCompetence={YYYY-MM}
```

**Parâmetros:**

- `therapyId` (obrigatório): UUID da terapia
- `startCompetence` (opcional): Competência inicial para filtro
- `endCompetence` (opcional): Competência final para filtro

**Resposta:**

```json
[
  {
    "id": "uuid",
    "therapyId": "uuid",
    "therapyName": "Psicologia",
    "competence": "2025-03",
    "valueCents": 17000,
    "value": 170,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
]
```

### 2. Buscar Valor por Competência

```http
GET /api/therapy-price-history/by-competence?therapyId={uuid}&competence={YYYY-MM}
```

**Parâmetros:**

- `therapyId` (obrigatório): UUID da terapia
- `competence` (obrigatório): Competência no formato YYYY-MM

**Resposta:**

```json
{
  "id": "uuid",
  "therapyId": "uuid",
  "therapyName": "Psicologia",
  "competence": "2025-01",
  "valueCents": 15000,
  "value": 150,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

**Códigos de Status:**

- `200`: Valor encontrado
- `404`: Nenhum valor cadastrado até a competência especificada
- `400`: Parâmetros inválidos

### 3. Criar Novo Valor

```http
POST /api/therapy-price-history
Content-Type: application/json

{
  "therapyId": "uuid",
  "competence": "2025-01",
  "value": 150
}
```

**Validações:**

- Terapia deve existir
- Competência deve estar no formato YYYY-MM válido
- Valor deve ser positivo
- Não pode haver valor duplicado para mesma terapia + competência

**Resposta:**

```json
{
  "id": "uuid",
  "therapyId": "uuid",
  "competence": "2025-01",
  "valueCents": 15000,
  "value": 150,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

### 4. Atualizar Valor

```http
PUT /api/therapy-price-history/{id}
Content-Type: application/json

{
  "value": 180
}
```

**Observações:**

- O `therapyId` não pode ser alterado
- A `competence` pode ser alterada, mas não pode gerar duplicata
- Apenas o valor pode ser atualizado livremente

### 5. Buscar por ID

```http
GET /api/therapy-price-history/{id}
```

### 6. Deletar Valor

```http
DELETE /api/therapy-price-history/{id}
```

## Uso no Frontend

### Hooks React Query

#### 1. Listar Histórico

```typescript
import { useTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

function MyComponent() {
  const { data, isLoading } = useTherapyPriceHistory(
    'therapy-id',
    '2025-01', // startCompetence (opcional)
    '2025-12'  // endCompetence (opcional)
  )

  return (
    <div>
      {data?.map(price => (
        <div key={price.id}>
          {price.competence}: R$ {price.value}
        </div>
      ))}
    </div>
  )
}
```

#### 2. Buscar Valor por Competência

```typescript
import { useTherapyPriceByCompetence } from '@/hooks/use-therapy-price-history'

function MyComponent() {
  const { data, isLoading, isError } = useTherapyPriceByCompetence(
    'therapy-id',
    '2025-03'
  )

  if (isError) {
    return <div>Nenhum valor cadastrado para esta competência</div>
  }

  return <div>Valor: R$ {data?.value}</div>
}
```

#### 3. Criar Novo Valor

```typescript
import { useCreateTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

function MyComponent() {
  const createMutation = useCreateTherapyPriceHistory()

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      therapyId: 'therapy-id',
      competence: '2025-01',
      value: 150
    })
  }

  return (
    <button onClick={handleCreate}>
      Adicionar Valor
    </button>
  )
}
```

#### 4. Atualizar Valor

```typescript
import { useUpdateTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

function MyComponent() {
  const updateMutation = useUpdateTherapyPriceHistory()

  const handleUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      data: { value: 180 }
    })
  }

  return <button onClick={() => handleUpdate('price-id')}>Atualizar</button>
}
```

#### 5. Deletar Valor

```typescript
import { useDeleteTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

function MyComponent() {
  const deleteMutation = useDeleteTherapyPriceHistory()

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return <button onClick={() => handleDelete('price-id')}>Deletar</button>
}
```

### Componentes Prontos

#### 1. Formulário de Preço

```typescript
import { TherapyPriceForm } from '@/components/therapy-price-form'

<TherapyPriceForm
  therapyId="therapy-id"
  priceHistory={existingPrice} // opcional, para edição
  onSuccess={() => console.log('Salvo!')}
  onCancel={() => console.log('Cancelado')}
/>
```

#### 2. Lista de Histórico

```typescript
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list'

<TherapyPriceHistoryList
  therapyId="therapy-id"
  therapyName="Psicologia" // opcional
/>
```

## Serviços (Funções Auxiliares)

### formatCompetence

Converte uma data em string no formato de competência:

```typescript
import { formatCompetence } from '@/services/therapy-price-history-service'

formatCompetence(new Date('2025-03-15')) // "2025-03"
formatCompetence('2025-03-15') // "2025-03"
formatCompetence('2025-03') // "2025-03"
```

### formatCurrency

Formata um valor numérico como moeda brasileira:

```typescript
import { formatCurrency } from '@/services/therapy-price-history-service'

formatCurrency(150.5) // "R$ 150,50"
```

### competenceToDate

Converte uma competência em Date (primeiro dia do mês):

```typescript
import { competenceToDate } from '@/services/therapy-price-history-service'

competenceToDate('2025-03') // Date(2025, 2, 1) - 01/03/2025
```

### isValidCompetence

Valida se uma string está no formato de competência válido:

```typescript
import { isValidCompetence } from '@/services/therapy-price-history-service'

isValidCompetence('2025-03') // true
isValidCompetence('2025-13') // false
isValidCompetence('2025-3') // false
```

## Casos de Uso

### 1. Cadastrar Valor Inicial

```typescript
// Ao criar uma nova terapia, cadastrar o valor inicial
const createTherapyPrice = useCreateTherapyPriceHistory()

await createTherapyPrice.mutateAsync({
  therapyId: newTherapy.id,
  competence: formatCompetence(new Date()),
  value: 150,
})
```

### 2. Atualizar Valor para Nova Competência

```typescript
// Quando o valor mudar, criar novo registro
const createTherapyPrice = useCreateTherapyPriceHistory()

await createTherapyPrice.mutateAsync({
  therapyId: therapy.id,
  competence: '2025-03', // nova competência
  value: 170, // novo valor
})
```

### 3. Consultar Valor em Billing/Faturamento

```typescript
// Ao criar um faturamento, buscar o valor correto pela competência
const { data: priceData } = useTherapyPriceByCompetence(therapyId, formatCompetence(billingDate))

// Usar priceData.value no cálculo do faturamento
```

### 4. Exibir Histórico na Página de Terapia

```typescript
function TherapyDetailsPage({ therapyId }: Props) {
  return (
    <div>
      <TherapyForm therapy={therapy} />
      <TherapyPriceHistoryList
        therapyId={therapyId}
        therapyName={therapy.name}
      />
    </div>
  )
}
```

## Migrations

Para aplicar as migrations no banco de dados:

```bash
# Gerar migrations (já foram geradas)
pnpm drizzle-kit generate

# Aplicar migrations
pnpm drizzle-kit push

# Ou usar o comando customizado se existir
pnpm db:push
```

## Boas Práticas

1. **Sempre use formatCompetence**: Para garantir consistência no formato
2. **Valores em centavos**: O banco armazena em centavos, mas a API trabalha com reais
3. **Não deletar valores antigos**: Mantenha o histórico completo para auditoria
4. **Validar antes de criar**: Use o endpoint `by-competence` para verificar se já existe valor
5. **Cache do React Query**: Os hooks já fazem cache e invalidação automática

## Troubleshooting

### Erro 409: Valor duplicado

```json
{
  "error": "Já existe um valor cadastrado para esta terapia nesta competência",
  "details": "Use PUT para atualizar o valor existente"
}
```

**Solução**: Busque o valor existente e use o endpoint PUT para atualizar.

### Erro 404: Nenhum valor encontrado

```json
{
  "error": "Nenhum valor encontrado",
  "details": "Não há valores cadastrados para a terapia 'X' até a competência 2024-12"
}
```

**Solução**: Cadastre um valor para uma competência anterior ou igual à desejada.

### Formato de competência inválido

```json
{
  "error": "Dados inválidos",
  "details": "Competência deve estar no formato YYYY-MM"
}
```

**Solução**: Use sempre o formato `YYYY-MM`, ex: `2025-01` (com zero à esquerda).

## Integração com Sistema de Billing

O sistema de histórico de preços pode ser integrado com o sistema de faturamento (billing) para buscar automaticamente o valor correto da terapia baseado na competência do faturamento:

```typescript
// Em billing-form.tsx ou similar
const competence = formatCompetence(formData.competenceDate)
const { data: therapyPrice } = useTherapyPriceByCompetence(
  formData.therapyId,
  competence,
  !!formData.therapyId && !!formData.competenceDate,
)

// Preencher automaticamente o campo de valor
useEffect(() => {
  if (therapyPrice) {
    form.setValue('sessionValue', therapyPrice.value)
  }
}, [therapyPrice])
```

## Próximos Passos

- [ ] Adicionar validação para impedir exclusão de valores sendo usados em billings
- [ ] Criar relatório de evolução de preços por terapia
- [ ] Adicionar exportação do histórico para Excel/CSV
- [ ] Implementar bulk import de valores por CSV
- [ ] Adicionar notificações quando valores estiverem desatualizados (ex: > 6 meses)
