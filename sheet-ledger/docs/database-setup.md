# Configuração do Banco de Dados

Este guia cobre a configuração do banco de dados PostgreSQL com Drizzle ORM para o projeto.

## Pré-requisitos

- PostgreSQL instalado e em execução
- Credenciais de acesso ao banco de dados

## Configuração do Drizzle

### Instalação das Dependências

```bash
# Instalar dependências do Drizzle e PostgreSQL
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

### Configuração do Drizzle

O arquivo `drizzle.config.ts` na raiz do projeto define a configuração para o CLI do Drizzle:

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schemas/*-schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### Estrutura do Banco de Dados

Os schemas do banco de dados são organizados em arquivos separados na pasta `src/db/schemas/`. Cada entidade tem seu próprio arquivo de schema:

1. **Estrutura de Arquivos:**

   - `src/db/schemas/user-schema.ts`
   - `src/db/schemas/patient-schema.ts`
   - `src/db/schemas/health-plan-schema.ts`
   - `src/db/schemas/guardian-schema.ts`
   - `src/db/schemas/professional-schema.ts`
   - `src/db/schemas/index.ts` (exporta todos os schemas)

2. **Exemplo de Schema:**

```typescript
// src/db/schemas/patient-schema.ts
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { guardians } from './guardian-schema'
import { healthPlans } from './health-plan-schema'

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  guardianId: integer('guardian_id').references(() => guardians.id),
  healthPlanId: integer('health_plan_id').references(() => healthPlans.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Definindo relações
export const patientsRelations = relations(patients, ({ one }) => ({
  guardian: one(guardians, {
    fields: [patients.guardianId],
    references: [guardians.id],
  }),
  healthPlan: one(healthPlans, {
    fields: [patients.healthPlanId],
    references: [healthPlans.id],
  }),
}))
```

### Arquivo de conexão com o banco

O arquivo `src/db/index.ts` configura a conexão com o banco de dados:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schemas'

// Verificar se a URL do banco de dados está definida
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definido')
}

// Criar pool de conexão
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Criar cliente Drizzle
export const db = drizzle(pool, { schema })
```

## Migrações

### Gerar Migrações

```bash
# Gerar arquivo de migração com base nas mudanças de schema
pnpm drizzle-kit generate

# ou usando npm script configurado no package.json
pnpm db:generate
```

### Executar Migrações

Execute o script de migração:

```bash
pnpm db:migrate
```

## Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
# Banco de Dados
DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco

# Outras configurações
```

Certifique-se de adicionar o arquivo `.env.local` ao `.gitignore` para não expor credenciais sensíveis.

## Boas Práticas

1. **Separação de schemas:** Manter schemas de diferentes entidades em arquivos separados
2. **Explícito sobre implícito:** Definir todas as restrições e relacionamentos explicitamente
3. **Validação:** Aplicar validação de dados antes da inserção no banco
4. **Transações:** Usar transações para operações que afetam múltiplas tabelas
5. **Tipagem:** Aproveitar o sistema de tipos do TypeScript com Drizzle para ter segurança completa de tipos
