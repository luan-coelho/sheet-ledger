# Solução de Compatibilidade com Edge Runtime

## Problema

A aplicação estava apresentando erros em produção na Vercel devido à incompatibilidade entre o Edge Runtime (usado pelo middleware) e consultas ao banco de dados:

```
Error [TypeError]: Cannot read properties of undefined (reading 'reduce')
at [project]/src/app/db/index.ts [middleware-edge] (ecmascript)
```

### Causa Raiz

1. **Localmente**: A aplicação roda em Node.js, que tem acesso completo às APIs necessárias
2. **Em produção (Vercel)**: O middleware sempre executa no Edge Runtime, que não tem acesso a todas as APIs do Node.js
3. **Problema específico**: O callback `signIn` do NextAuth estava fazendo consultas ao banco de dados, que são executadas também no contexto do middleware

## Solução Implementada: Split Config

Baseada na [documentação oficial do Auth.js](https://authjs.dev/guides/edge-compatibility), implementamos a técnica "Split Config":

### 1. Configuração Básica (`auth.config.ts`)

```typescript
// Configuração sem adapter, compatível com Edge Runtime
export default {
  providers: [Google(...)],
  session: { strategy: 'jwt' },
  pages: {...},
  // SEM callbacks que fazem consultas ao banco
} satisfies NextAuthConfig
```

### 2. Configuração Completa (`auth.ts`)

```typescript
// Importa a configuração básica e adiciona consultas ao banco
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      // Consultas ao banco de dados aqui
      const existingUser = await db.select()...
    }
  }
})
```

### 3. Middleware Edge-Compatible (`middleware.ts`)

```typescript
// Usa APENAS a configuração básica
import authConfig from '@/lib/auth.config'

const { auth: middleware } = NextAuth(authConfig)

export default middleware(req => {
  // Lógica de redirecionamento sem consultas ao banco
})
```

## Resultado

✅ **Middleware**: Executa no Edge Runtime sem consultas ao banco
✅ **API Routes**: Continuam usando a configuração completa com acesso ao banco
✅ **Páginas**: Mantêm funcionalidade completa de autenticação
✅ **Segurança**: Verificações de usuário continuam funcionando nas rotas protegidas

## Limitações

- O middleware não pode mais fazer consultas diretas ao banco de dados
- Verificações de usuário ativo/inativo são feitas apenas durante o login e nas rotas protegidas
- A estratégia de sessão deve ser JWT (não database)

## Verificação

O comando `npm run build` agora executa com sucesso:

```
✓ Compiled successfully
ƒ Middleware: 87.8 kB
```

Esta solução garante compatibilidade total com o Edge Runtime da Vercel mantendo toda a funcionalidade de autenticação e autorização da aplicação.
