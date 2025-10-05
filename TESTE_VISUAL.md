# Teste Visual - Sistema de Histórico de Preços de Terapias

Este guia mostra como testar visualmente todas as funcionalidades implementadas.

## 🚀 Pré-requisitos

1. **Aplicar migrations:**

```bash
cd sheet-ledger
pnpm drizzle-kit push
```

2. **Iniciar servidor de desenvolvimento:**

```bash
pnpm dev
```

3. **Acessar aplicação:**

```
http://localhost:3000
```

## 📋 Checklist de Testes

### ✅ Teste 1: Verificar Botão "Valores" na Tabela

**Passos:**

1. Fazer login na aplicação
2. Navegar para `/admin/therapies`
3. Verificar se existe uma tabela com terapias
4. **Verificar:** Cada linha deve ter um botão "Valores" (ícone de cifrão $)

**Resultado Esperado:**

- ✅ Botão "Valores" visível em cada linha
- ✅ Botão tem ícone de cifrão ($)
- ✅ Botão está ao lado do menu de ações (3 pontinhos)

**Screenshot de referência:**

```
┌─────────────────────┬────────┬──────────────────┐
│ Nome                │ Status │ Ações            │
├─────────────────────┼────────┼──────────────────┤
│ Psicologia          │ Ativa  │ [$ Valores] [⋮] │
│ Fisioterapia        │ Ativa  │ [$ Valores] [⋮] │
└─────────────────────┴────────┴──────────────────┘
```

---

### ✅ Teste 2: Abrir Dialog de Gerenciamento

**Passos:**

1. Clicar no botão "Valores" de qualquer terapia
2. Aguardar abertura do dialog

**Resultado Esperado:**

- ✅ Dialog abre com animação suave
- ✅ Título: "Gerenciar Valores"
- ✅ Subtítulo: "Configure o histórico de valores da terapia '[Nome]'"
- ✅ Dialog tem largura apropriada (900px)
- ✅ Dialog tem scroll se necessário

---

### ✅ Teste 3: Estado Vazio

**Passos:**

1. Abrir dialog de uma terapia sem valores cadastrados
2. Observar mensagem de estado vazio

**Resultado Esperado:**

- ✅ Mensagem: "Nenhum valor cadastrado ainda."
- ✅ Submensagem: "Clique em 'Adicionar Valor' para começar."
- ✅ Botão "Adicionar Valor" visível no topo
- ✅ Área centralizada e visualmente agradável

---

### ✅ Teste 4: Adicionar Primeiro Valor

**Passos:**

1. Clicar em "Adicionar Valor"
2. Dialog de formulário abre
3. Clicar no campo "Competência (Mês/Ano)"
4. Calendário abre
5. Selecionar "Janeiro de 2025"
6. Campo deve mostrar "janeiro de 2025"
7. Digitar "150" no campo "Valor (R$)"
8. Clicar em "Adicionar Valor"

**Resultado Esperado:**

- ✅ Formulário fecha automaticamente
- ✅ Toast de sucesso aparece: "Valor da terapia cadastrado com sucesso!"
- ✅ Tabela atualiza e mostra o novo valor
- ✅ Valor aparece formatado: "R$ 150,00"
- ✅ Competência aparece: "janeiro de 2025"

---

### ✅ Teste 5: Adicionar Segundo Valor (Maior)

**Passos:**

1. Clicar em "Adicionar Valor" novamente
2. Selecionar "Março de 2025"
3. Digitar "170"
4. Salvar

**Resultado Esperado:**

- ✅ Valor adicionado com sucesso
- ✅ Tabela mostra 2 valores
- ✅ Valores ordenados por competência (mais recente primeiro):
  - Março 2025: R$ 170,00
  - Janeiro 2025: R$ 150,00
- ✅ Variação percentual aparece na linha de Março:
  - Ícone ↑ (seta para cima)
  - Texto verde: "+13.3%"

**Visual esperado:**

```
┌──────────────────┬──────────────┬───────────┬─────────┐
│ Competência      │ Valor        │ Variação  │ Ações   │
├──────────────────┼──────────────┼───────────┼─────────┤
│ março de 2025    │ R$ 170,00    │ ↑ +13.3%  │ [✏] [🗑] │
│ janeiro de 2025  │ R$ 150,00    │ —         │ [✏] [🗑] │
└──────────────────┴──────────────┴───────────┴─────────┘
```

---

### ✅ Teste 6: Badge "Atual"

**Passos:**

1. Adicionar valor para o mês atual (ex: Janeiro 2025 se estamos em janeiro)
2. Verificar se badge "Atual" aparece

**Resultado Esperado:**

- ✅ Badge "Atual" aparece ao lado da competência do mês corrente
- ✅ Badge tem estilo outline
- ✅ Badge não aparece em meses passados/futuros

---

### ✅ Teste 7: Editar Valor

**Passos:**

1. Clicar no ícone de lápis (✏) em qualquer linha
2. Dialog de edição abre
3. Campo de competência está **desabilitado** (não pode alterar)
4. Campo de valor está preenchido com valor atual
5. Alterar valor para "180"
6. Clicar em "Atualizar Valor"

**Resultado Esperado:**

- ✅ Dialog fecha
- ✅ Toast: "Valor da terapia atualizado com sucesso!"
- ✅ Tabela atualiza mostrando novo valor
- ✅ Variação percentual recalculada

---

### ✅ Teste 8: Tentar Adicionar Valor Duplicado

**Passos:**

1. Clicar em "Adicionar Valor"
2. Selecionar competência que JÁ EXISTE (ex: Janeiro 2025)
3. Digitar qualquer valor
4. Tentar salvar

**Resultado Esperado:**

- ✅ Toast de erro aparece
- ✅ Mensagem: "Já existe um valor cadastrado para esta terapia nesta competência"
- ✅ Dialog não fecha
- ✅ Usuário pode cancelar ou corrigir

---

### ✅ Teste 9: Deletar Valor

**Passos:**

1. Clicar no ícone de lixeira (🗑) em qualquer linha
2. Alert dialog de confirmação abre
3. Ler mensagem: "Tem certeza que deseja excluir este valor?"
4. Clicar em "Excluir"

**Resultado Esperado:**

- ✅ Dialog fecha
- ✅ Toast: "Valor da terapia removido com sucesso!"
- ✅ Linha some da tabela
- ✅ Variações percentuais das outras linhas recalculadas

---

### ✅ Teste 10: Validação de Valor Negativo

**Passos:**

1. Tentar adicionar valor com número negativo (ex: -50)
2. Ou valor zero

**Resultado Esperado:**

- ✅ Erro de validação aparece
- ✅ Mensagem: "Valor deve ser maior que zero"
- ✅ Botão de salvar pode estar desabilitado

---

### ✅ Teste 11: Fechar Dialog

**Passos:**

1. Abrir dialog de valores
2. Clicar fora do dialog (no backdrop escuro)
3. Ou clicar no X no canto superior direito

**Resultado Esperado:**

- ✅ Dialog fecha suavemente
- ✅ Volta para tabela de terapias
- ✅ Nenhum erro no console

---

### ✅ Teste 12: Responsividade

**Passos:**

1. Abrir dialog em tela grande (desktop)
2. Redimensionar janela para tablet
3. Redimensionar para mobile

**Resultado Esperado:**

- ✅ Desktop (>900px): Dialog tem largura de 900px
- ✅ Tablet (600-900px): Dialog ocupa 90% da largura
- ✅ Mobile (<600px): Dialog ocupa largura total com padding
- ✅ Tabela tem scroll horizontal se necessário
- ✅ Botões mantêm tamanho apropriado

---

## 🔧 Teste de API (Opcional)

Se quiser testar diretamente a API:

### 1. Criar Valor

```bash
curl -X POST http://localhost:3000/api/therapy-price-history \
  -H "Content-Type: application/json" \
  -d '{
    "therapyId": "UUID_DA_TERAPIA",
    "competence": "2025-01",
    "value": 150
  }'
```

### 2. Listar Valores

```bash
curl "http://localhost:3000/api/therapy-price-history?therapyId=UUID_DA_TERAPIA"
```

### 3. Buscar por Competência

```bash
curl "http://localhost:3000/api/therapy-price-history/by-competence?therapyId=UUID_DA_TERAPIA&competence=2025-01"
```

### 4. Buscar Competência Sem Valor Exato (Fallback)

```bash
# Se só tem valor em 2025-01, buscar 2025-02 deve retornar 2025-01
curl "http://localhost:3000/api/therapy-price-history/by-competence?therapyId=UUID_DA_TERAPIA&competence=2025-02"
```

---

## 🐛 Troubleshooting

### Problema: Botão "Valores" não aparece

**Solução:**

- Verificar se salvou os arquivos
- Recarregar página (Ctrl+R ou Cmd+R)
- Verificar console do navegador por erros

### Problema: Erro ao abrir dialog

**Solução:**

- Verificar console do navegador
- Verificar se migrations foram aplicadas
- Verificar se terapia tem ID válido

### Problema: Não consegue salvar valor

**Solução:**

- Verificar se competência está no formato correto (YYYY-MM)
- Verificar se valor é positivo
- Verificar se não existe valor duplicado
- Verificar console do navegador

### Problema: Toast não aparece

**Solução:**

- Verificar se Sonner está configurado no layout
- Verificar console por erros

---

## ✅ Checklist Final

Depois de executar todos os testes acima, verifique:

- [ ] Botão "Valores" aparece em todas as terapias
- [ ] Dialog abre e fecha corretamente
- [ ] Estado vazio é exibido quando não há valores
- [ ] Consegue adicionar novos valores
- [ ] Valores aparecem formatados corretamente
- [ ] Variação percentual é calculada
- [ ] Ícones de tendência aparecem (↑↓)
- [ ] Badge "Atual" aparece no mês corrente
- [ ] Consegue editar valores
- [ ] Competência não pode ser editada
- [ ] Não permite valores duplicados
- [ ] Consegue deletar valores
- [ ] Confirmação de exclusão funciona
- [ ] Validações funcionam (valor positivo)
- [ ] Toasts aparecem em todas as ações
- [ ] Responsivo em diferentes tamanhos de tela
- [ ] Nenhum erro no console do navegador

---

## 🎉 Teste Bem-Sucedido!

Se todos os itens estão marcados, o sistema está funcionando perfeitamente!

**Status:** ✅ Sistema pronto para uso em produção

**Próximos Passos:**

1. Cadastrar valores para todas as terapias existentes
2. Integrar busca de valores no formulário de billing (se aplicável)
3. Treinar usuários finais

---

**Tempo estimado de teste:** 15-20 minutos
**Dificuldade:** 🟢 Fácil
**Cobertura:** 🟢 Completa
