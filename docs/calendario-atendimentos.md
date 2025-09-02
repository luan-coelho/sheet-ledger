# Calendário de Atendimentos

Este documento descreve a implementação do calendário de atendimentos no formulário de geração de planilhas.

## Funcionalidade Implementada

Foi adicionado um **calendário interativo** que exibe visualmente as datas selecionadas no formulário de geração de planilhas de atendimento.

### Características

1. **Botão "Ver Calendário"**: Adicionado aos botões de ação do formulário, permite visualizar o calendário após o preenchimento dos campos obrigatórios.

2. **Visualização Completa**: O calendário mostra:
   - **Resumo estatístico**: Número total de dias de atendimento, total de sessões e período selecionado
   - **Cronograma detalhado**: Lista scrollável com todos os dias de atendimento, horários e número de sessões
   - **Calendário visual**: Grade mensal mostrando os dias marcados com indicadores visuais

3. **Cálculo Inteligente**:
   - Considera apenas os dias da semana selecionados no formulário
   - Respeita o período entre data de início e fim
   - Calcula automaticamente o total de sessões baseado na configuração de cada dia

4. **Interface Responsiva**:
   - Layout adaptável para desktop e mobile
   - Scroll automático para o calendário ao abrir
   - Botão de fechar para esconder o calendário

## Componentes Criados

### `SpreadsheetCalendar`

- **Localização**: `/src/components/spreadsheet-calendar.tsx`
- **Função**: Componente principal que renderiza o calendário
- **Props**:
  - `formData`: Dados do formulário para calcular as datas
  - `onClose`: Função para fechar o calendário

### `SimpleCalendar` (interno)

- **Função**: Componente de calendário visual simplificado
- **Características**:
  - Grade mensal com todos os dias
  - Destaque visual para dias de atendimento
  - Indicadores de número de sessões por dia
  - Diferenciação entre dias do mês atual e outros

## Integração com o Formulário

O calendário foi integrado no componente `SpreadsheetForm` com:

1. **Estado**: `showCalendar` para controlar a visibilidade
2. **Função**: `handleShowCalendar()` para validar o formulário antes de mostrar
3. **Ref**: `calendarRef` para scroll automático
4. **Botão**: Novo botão "Ver Calendário" na seção de ações

## Validação

O calendário só é exibido após a validação completa do formulário, garantindo que:

- Todas as datas estão preenchidas corretamente
- Pelo menos um dia da semana foi selecionado
- Os campos obrigatórios estão preenchidos

## Benefícios

1. **Visualização Clara**: Facilita a compreensão do cronograma de atendimentos
2. **Validação Visual**: Permite verificar se o período e dias estão corretos antes de gerar a planilha
3. **Experiência Melhorada**: Interface mais intuitiva e profissional
4. **Responsive**: Funciona bem em dispositivos móveis e desktop

## Dependências Utilizadas

- `date-fns`: Para manipulação e formatação de datas
- `date-fns/locale/ptBR`: Para localização em português brasileiro
- `lucide-react`: Para ícones da interface
- Componentes UI existentes do projeto (Card, Button, Badge, etc.)

## Exemplo de Uso

1. Preencha o formulário com todos os campos obrigatórios
2. Selecione o período (data início e fim)
3. Configure os dias da semana e horários
4. Clique em "Ver Calendário"
5. O calendário aparecerá mostrando uma visão completa do cronograma

O calendário é uma ferramenta de apoio que complementa a funcionalidade existente, oferecendo uma visualização clara e profissional do cronograma de atendimentos antes da geração das planilhas.
