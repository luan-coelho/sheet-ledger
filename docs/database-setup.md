# Configuração do Banco de Dados Supabase

Este projeto utiliza PostgreSQL do Supabase com Drizzle ORM.

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Database
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-key-aqui"
```

### 2. Scripts Disponíveis

```bash
# Gerar migrações
npm run db:generate

# Aplicar migrações
npm run db:migrate

# Push schema direto (desenvolvimento)
npm run db:push

# Configurar banco completo
npm run db:setup

# Abrir Drizzle Studio
npm run db:studio

# Seed do banco
npm run db:seed

# Criar usuário admin
npm run db:seed:create-admin-user
```

### 3. Primeiro Setup

1. Configure sua DATABASE_URL no `.env.local`
2. Execute: `npm run db:setup`
3. Execute: `npm run db:seed:create-admin-user`

### 4. Estrutura das Tabelas

- **users**: Usuários do sistema
- **professionals**: Profissionais de saúde
- **patients**: Pacientes
- **guardians**: Responsáveis pelos pacientes
- **health_plans**: Planos de saúde

## Comandos Úteis

### Gerar Nova Migração
```bash
npm run db:generate
```

### Aplicar Migrações
```bash
npm run db:migrate
```

### Visualizar Banco
```bash
npm run db:studio
```

## Troubleshooting

### Erro de Conexão
- Verifique se a DATABASE_URL está correta
- Confirme se o projeto Supabase está ativo
- Execute `npm run db:setup` para testar a conexão

### Tabelas não Existem
- Execute `npm run db:push` ou `npm run db:migrate`
- Verifique se as migrações foram aplicadas

### Problemas de SSL
- Em produção, SSL é obrigatório
- Em desenvolvimento, SSL é opcional 