# Convenções e Padrões de Código

Este documento descreve as convenções e padrões adotados neste projeto para garantir consistência e manutenibilidade.

## Tecnologias Principais

- **Node.js:** v20
- **React:** v19
- **Next.js:** v15 (App Router)
- **TypeScript:** v5
- **Tailwind CSS:** v4
- **Shadcn UI:** última versão compatível com Tailwind 4
- **Drizzle ORM:** com PostgreSQL
- **React Query:** para gerenciamento de estado do servidor

## Estrutura de Diretórios

```
src/
  ├── app/               # Rotas e páginas (Next.js App Router)
  │   ├── api/           # Rotas da API
  │   ├── auth/          # Páginas de autenticação
  │   └── [módulos]/     # Páginas específicas de módulos
  │
  ├── components/        # Componentes React reutilizáveis
  │   ├── auth/          # Componentes relacionados à autenticação
  │   ├── ui/            # Componentes de interface (Shadcn)
  │   └── [features]/    # Componentes específicos de features
  │
  ├── db/                # Configuração e schemas do banco de dados
  │   └── schemas/       # Schemas Drizzle
  │
  ├── hooks/             # Hooks React personalizados
  │   ├── use-queries/   # Hooks para React Query (leitura)
  │   └── use-mutations/ # Hooks para React Query (escrita)
  │
  ├── lib/               # Funções utilitárias e serviços
  │
  └── services/          # Serviços para comunicação com a API
```

## Convenções de Nomenclatura

### Arquivos e Diretórios

- Utilizar **kebab-case** para nomes de arquivos e diretórios
  - Exemplo: `user-profile.tsx`, `health-plans/`
- Componentes React usam PascalCase no nome da função, mas kebab-case no nome do arquivo
  - Arquivo: `user-avatar.tsx`
  - Componente: `export function UserAvatar()`
- Nomes em inglês para os arquivos e diretórios

### Componentes

- Funções de componentes com nome em **PascalCase**
- Props interfaces com o padrão `[ComponentName]Props`
- Funções de eventos com prefixo `handle`
  - Exemplo: `handleClick`, `handleSubmit`

### Hooks

- Prefixo `use` seguido do nome descritivo
  - Exemplo: `usePatients`, `useHealthPlans`

### APIs e Serviços

- Sufixo `-service` para serviços
  - Exemplo: `patient-service.ts`, `guardian-service.ts`
- Rotas de API organizadas por recursos REST
  - Exemplo: `/api/patients`, `/api/patients/[id]`
- Sempre utilizar os nomes das rotas definidos no arquivo `routes.ts`
- Nomes em inglês para as rotas

## Padrões de Código

### Componentes React

- Preferir Server Components quando possível
- Adicionar diretiva `'use client'` apenas quando necessário
- Utilizar funções nomeadas para componentes (não arrow functions)
- Implementar separação de responsabilidades:
  - Lógica de UI nos componentes
  - Lógica de negócios nos hooks/serviços
- Utilizar uma interface para definir as props de cada componente somente se tiver mais de uma propriedade
- Evite utilizar o hook `useState` para gerenciar o estado de cada componente

```typescript
// Exemplo de componente
export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conteúdo */}
      </CardContent>
    </Card>
  );
}
```

### TypeScript

- Usar TypeScript para todos os arquivos
- Preferir `interface` para definições de tipos de objetos
- Evitar `any`, usar tipos genéricos ou `unknown` quando necessário
- Definir tipos para props de componentes, parâmetros de funções e retornos

### Services

- Sempre encapsular as chamadas de API em services
- Os nomes dos services devem ser em kebab-case e com sufixo `.service.ts`, exemplo: `patient.service.ts`
- Os services devem ser exportados como default
- Os services devem ser importados com o nome do arquivo, exemplo: `import patientService from '@/services/patient.service'`
- Não seja redudante em nomes de funções, exemplo: `getAll` ao invés de `getAllPatients`
- Os services devem ser usados em vez de fazer chamadas diretas à API

### Estado e Fetching de Dados

- Utilizar React Query para chamadas de API
- Implementar hooks personalizados para queries e mutations
- Utilize os services para fazer as chamadas de API através de hooks
- Utilizar `useActionState` em vez do obsoleto `useFormState`
- Minimizar estado do lado do cliente
- Utilize a variavel routes para definir as rotas de cada query
- Utilize a variavel queryKeys para definir as chaves de cada query
- Evite utilizar o hook `useState` para gerenciar o estado de cada query

```typescript
// Exemplo de hook com React Query
export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: async () => {
      const response = await fetch(routes.patients)
      if (!response.ok) throw new Error('Erro ao buscar pacientes')
      return response.json()
    },
  })
}
```

## Banco de Dados com Drizzle

- Schemas organizados por entidade em arquivos separados com sufixo `-schema.ts`
- Os nomes das tabelas devem ser em kebab-case
- As variaveis const devem ter o sufixo `Table`
- Os schemas de relacionamento devem ficar no mesmo arquivo que a entidade principal
- Exportar schemas e relações de um único ponto de entrada
- Definir relações explicitamente

```typescript
// Exemplo de schema
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt'),
})
```

## UI e Estilização

### Tailwind CSS

- Utilizar classes do Tailwind para toda estilização
- Usar o formato `class:` para condicionais em vez de operador ternário
- Organizar classes por categoria (layout, spacing, colors, etc.)

### Shadcn UI

- Usar componentes do Shadcn UI como base para a interface
- Customizar temas via `theme-config.ts`
- Estender componentes quando necessário em vez de duplicá-los

## Autenticação

- Implementar autenticação com NextAuth.js
- Usar middleware para proteção de rotas
- Utilizar componentes de autenticação encapsulados

## Scripts e Utilitários

- Criar scripts para tarefas comuns em `scripts/`
- Manter funções utilitárias em `lib/`
- Documentar propósito e uso de cada utilitário

## Boas Práticas

- Implementar retornos antecipados (early returns) para melhor legibilidade
- Usar componentes acessíveis com atributos ARIA apropriados
- Seguir o princípio DRY (Don't Repeat Yourself)
- Implementar error boundaries e tratamento adequado de erros
