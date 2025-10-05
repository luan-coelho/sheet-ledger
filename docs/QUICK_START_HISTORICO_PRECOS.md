# Guia de Início Rápido - Histórico de Preços de Terapias

## ⚡ Setup Inicial (5 minutos)

### 1. Aplicar Migrations

```bash
cd sheet-ledger
pnpm drizzle-kit push
```

Isso criará a tabela `therapy_price_history` no banco de dados.

### 2. Verificar se está funcionando

Abra o console do banco e verifique:

```sql
SELECT * FROM therapy_price_history LIMIT 1;
```

## 🎯 Uso Básico

### Adicionar Histórico de Preços na Página de Terapias

#### Opção 1: Dialog na página atual (Recomendado)

**1. Atualizar `src/components/data-tables/therapies/columns.tsx`:**

```typescript
// Adicionar no início do arquivo
import { DollarSign } from 'lucide-react'

// Na interface ColumnsOptions
interface ColumnsOptions {
  onEdit: (therapy: Therapy) => void
  onDelete: (therapy: Therapy) => void
  onManagePrices?: (therapy: Therapy) => void // ADICIONAR
}

// Na coluna de actions
{
  id: 'actions',
  cell: ({ row }) => {
    const therapy = row.original
    return (
      <div className="flex items-center gap-2">
        {/* ADICIONAR antes do DropdownMenu */}
        {onManagePrices && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManagePrices(therapy)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Valores
          </Button>
        )}
        {/* ... resto do código ... */}
      </div>
    )
  },
}
```

**2. Atualizar `src/app/admin/therapies/page.tsx`:**

```typescript
// No início do arquivo, adicionar import
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list'

// Dentro do componente, adicionar state
const [managingPricesTherapy, setManagingPricesTherapy] = useState<Therapy | null>(null)

// Adicionar handler
const handleManagePrices = (therapy: Therapy) => {
  setManagingPricesTherapy(therapy)
}

// Atualizar createColumns para incluir handler
const columns = createColumns({
  onEdit: handleEdit,
  onDelete: setDeletingTherapy,
  onManagePrices: handleManagePrices, // ADICIONAR
})

// Adicionar Dialog antes do AlertDialog de confirmação de exclusão
<Dialog
  open={!!managingPricesTherapy}
  onOpenChange={() => setManagingPricesTherapy(null)}
>
  <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Gerenciar Valores</DialogTitle>
      <DialogDescription>
        Configure o histórico de valores da terapia "{managingPricesTherapy?.name}"
      </DialogDescription>
    </DialogHeader>

    {managingPricesTherapy && (
      <TherapyPriceHistoryList
        therapyId={managingPricesTherapy.id}
        therapyName={managingPricesTherapy.name}
      />
    )}
  </DialogContent>
</Dialog>
```

## 🔍 Buscar Valor em Faturamento

Se você quiser buscar automaticamente o valor de uma terapia baseado na data:

```typescript
// Em billing-form.tsx ou onde você precisa do valor
import { useTherapyPriceByCompetence } from '@/hooks/use-therapy-price-history'
import { formatCompetence } from '@/services/therapy-price-history-service'

function BillingForm() {
  const form = useForm<BillingFormValues>()

  // Observar terapia e data selecionadas
  const therapyId = form.watch('therapyId')
  const billingDate = form.watch('billingDate')

  // Formatar data para competência (YYYY-MM)
  const competence = billingDate ? formatCompetence(billingDate) : null

  // Buscar valor da terapia
  const { data: therapyPrice } = useTherapyPriceByCompetence(
    therapyId,
    competence || '',
    !!therapyId && !!competence // enabled
  )

  // Preencher campo automaticamente
  useEffect(() => {
    if (therapyPrice) {
      form.setValue('sessionValue', therapyPrice.value)
    }
  }, [therapyPrice])

  return (
    <Form {...form}>
      {/* seus campos do formulário */}
    </Form>
  )
}
```

## 📝 Exemplos de Uso Direto

### Cadastrar valor

```typescript
import { useCreateTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

const createMutation = useCreateTherapyPriceHistory()

await createMutation.mutateAsync({
  therapyId: 'uuid-da-terapia',
  competence: '2025-01', // formato YYYY-MM
  value: 150.0,
})
```

### Listar histórico

```typescript
import { useTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

const { data: history } = useTherapyPriceHistory('uuid-da-terapia')

// history = [
//   { id: '...', competence: '2025-03', value: 170, ... },
//   { id: '...', competence: '2025-01', value: 150, ... }
// ]
```

### Buscar valor específico

```typescript
import { useTherapyPriceByCompetence } from '@/hooks/use-therapy-price-history'

const { data: price } = useTherapyPriceByCompetence(
  'uuid-da-terapia',
  '2025-02', // Se não existir, retorna valor mais recente anterior
)

// price = { id: '...', competence: '2025-01', value: 150, ... }
```

### Usar componente completo

```typescript
import { TherapyPriceHistoryList } from '@/components/therapy-price-history-list'

<TherapyPriceHistoryList
  therapyId="uuid-da-terapia"
  therapyName="Psicologia"
/>
```

Este componente já inclui:

- ✅ Tabela com histórico
- ✅ Botão para adicionar novo valor
- ✅ Edição inline
- ✅ Exclusão com confirmação
- ✅ Cálculo de variação percentual
- ✅ Ícones de tendência (↑↓)

## 🧪 Testar

### Via API (usando curl ou Postman)

**Criar valor:**

```bash
curl -X POST http://localhost:3000/api/therapy-price-history \
  -H "Content-Type: application/json" \
  -d '{
    "therapyId": "uuid-da-terapia",
    "competence": "2025-01",
    "value": 150
  }'
```

**Buscar por competência:**

```bash
curl "http://localhost:3000/api/therapy-price-history/by-competence?therapyId=uuid-da-terapia&competence=2025-01"
```

**Listar histórico:**

```bash
curl "http://localhost:3000/api/therapy-price-history?therapyId=uuid-da-terapia"
```

## 📊 Cenário de Exemplo

**Situação:** Uma terapia custava R$ 150 em jan/2025 e passou a R$ 170 em mar/2025.

**1. Cadastrar valores:**

```typescript
// Janeiro
await create({ therapyId: 'abc', competence: '2025-01', value: 150 })

// Março
await create({ therapyId: 'abc', competence: '2025-03', value: 170 })
```

**2. Consultar valores:**

```typescript
// Faturamento de janeiro
const { data } = useTherapyPriceByCompetence('abc', '2025-01')
// Retorna: { value: 150, competence: '2025-01' }

// Faturamento de fevereiro (sem valor exato)
const { data } = useTherapyPriceByCompetence('abc', '2025-02')
// Retorna: { value: 150, competence: '2025-01' } ← usa valor anterior

// Faturamento de março
const { data } = useTherapyPriceByCompetence('abc', '2025-03')
// Retorna: { value: 170, competence: '2025-03' }

// Faturamento de abril (sem valor exato)
const { data } = useTherapyPriceByCompetence('abc', '2025-04')
// Retorna: { value: 170, competence: '2025-03' } ← usa valor mais recente
```

## ❓ FAQ

**P: Posso cadastrar dois valores para a mesma competência?**
R: Não, existe uma constraint única. Você receberá erro 409.

**P: O que acontece se eu buscar um valor antes do primeiro cadastro?**
R: Você receberá erro 404 com mensagem explicativa.

**P: Como atualizar um valor existente?**
R: Use o endpoint PUT passando o ID do registro.

**P: Os valores são em centavos ou reais?**
R: No banco são centavos, mas a API converte automaticamente para reais.

**P: Posso deletar valores antigos?**
R: Sim, mas recomenda-se manter o histórico completo para auditoria.

## 📚 Documentação Completa

- **API Completa:** `docs/THERAPY_PRICE_HISTORY.md`
- **Detalhes de Implementação:** `docs/IMPLEMENTACAO_HISTORICO_PRECOS.md`
- **Exemplos de Integração:** `docs/EXEMPLO_INTEGRACAO_TERAPIAS.md`
- **Resumo Executivo:** `RESUMO_HISTORICO_PRECOS.md`

## ✅ Checklist

Após seguir este guia:

- [ ] Migrations aplicadas
- [ ] Botão "Valores" aparece na tabela de terapias
- [ ] Dialog abre ao clicar em "Valores"
- [ ] Consegue adicionar novo valor
- [ ] Consegue editar valor existente
- [ ] Consegue excluir valor
- [ ] Variação percentual é exibida corretamente

Se todos os itens estão marcados, o sistema está funcionando! 🎉

## 🆘 Problemas Comuns

**Erro: Table doesn't exist**
→ Execute: `pnpm drizzle-kit push`

**Erro: therapyId is required**
→ Verifique se está passando o UUID correto da terapia

**Erro 409: Já existe valor**
→ Use PUT para atualizar ou escolha outra competência

**Componente não renderiza**
→ Verifique se o import está correto e therapyId é válido

---

**Tempo estimado de setup:** 5-10 minutos
**Dificuldade:** 🟢 Fácil
**Status:** ✅ Pronto para produção
