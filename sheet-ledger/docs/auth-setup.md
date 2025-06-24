# Configuração de Autenticação

Este guia cobre a configuração completa do sistema de autenticação usando NextAuth.js no projeto.

## Instalação das Dependências

```bash
# Instalar NextAuth.js e dependências
pnpm add next-auth@beta
```

## Configuração do NextAuth.js

### Rota de API

A configuração principal do NextAuth fica dentro da pasta `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schemas/user-schema'
import bcrypt from 'bcrypt'

// Configuração do NextAuth
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Páginas personalizadas
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Callbacks personalizados
  callbacks: {
    // Validar sessão
    async session({ session, token }) {
      // Adicionar informações do usuário à sessão
      if (session?.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },

    // JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },

  // Provedores de autenticação
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Buscar usuário no banco de dados
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        })

        // Verificar se o usuário existe
        if (!user || !user.password) {
          return null
        }

        // Verificar senha
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        // Retornar objeto do usuário (sem senha)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})

// Handlers para as rotas de API
export { handlers as GET, handlers as POST }
```

### Arquivo de Lib para Autenticação

Crie um arquivo `src/lib/auth.ts` para funções auxiliares:

```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route'

// Tipos para o usuário autenticado
export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

// Obter sessão do usuário atual
export async function getSession() {
  return await auth()
}

// Obter usuário autenticado atual
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  return session.user as AuthUser
}

// Verificar se o usuário está autenticado
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

// Verificar se o usuário tem determinada função
export async function hasRole(role: string) {
  const user = await getCurrentUser()
  return user?.role === role
}

// Verificar se é administrador
export async function isAdmin() {
  return hasRole('admin')
}
```

### Middleware para Proteção de Rotas

Crie um arquivo `middleware.ts` na raiz do projeto para proteger rotas:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rotas públicas que não requerem autenticação
const publicRoutes = ['/auth/signin', '/auth/error']

// Rotas de administrador
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Obter token de autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirecionar para login se não estiver autenticado
  if (!token) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Verificar permissões para rotas de administrador
  if (adminRoutes.some(route => pathname.startsWith(route)) && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configurar o matcher para aplicar o middleware apenas em certas rotas
export const config = {
  matcher: [
    // Proteger todas as rotas exceto as públicas e estáticas
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

## Componentes de Autenticação

### Componente Provider

O `SessionProvider` deve ser adicionado no layout raiz para compartilhar a sessão:

```tsx
// src/components/session-provider.tsx
'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### Componentes de UI para Autenticação

#### Formulário de Login

```tsx
// src/components/auth/sign-in-form.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciais inválidas')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('Ocorreu um erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Login</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

#### Componente de Menu de Usuário

```tsx
// src/components/auth/user-menu.tsx
'use client'

import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/auth/user-avatar'

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserAvatar user={session.user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && <p className="font-medium">{session.user.name}</p>}
            {session.user.email && <p className="text-sm text-muted-foreground">{session.user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={event => {
            event.preventDefault()
            signOut({ callbackUrl: '/auth/signin' })
          }}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Componente de Proteção de Páginas

```tsx
// src/components/protected-page.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

interface ProtectedPageProps {
  children: React.ReactNode
  role?: string
}

export async function ProtectedPage({ children, role }: ProtectedPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  if (role && user.role !== role) {
    redirect('/')
  }

  return <>{children}</>
}
```

## Páginas de Autenticação

### Página de Login

```tsx
// src/app/auth/signin/page.tsx
import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
```

### Página de Erro de Autenticação

```tsx
// src/app/auth/error/page.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Erro de Autenticação</h1>
          <p className="text-sm text-muted-foreground">Ocorreu um erro durante a autenticação</p>
        </div>
        <Button asChild>
          <Link href="/auth/signin">Tentar Novamente</Link>
        </Button>
      </div>
    </div>
  )
}
```

## Configuração de Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env.local`:

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_segredo_jwt_muito_seguro

# Admin User (para script de criação)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha_admin_segura
```

## Script para Criar Usuário Administrador

```typescript
// scripts/create-admin-user.ts
import bcrypt from 'bcrypt'
import { db } from '../src/db'
import { users } from '../src/db/schemas/user-schema'

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('ADMIN_EMAIL e ADMIN_PASSWORD devem ser definidos')
    process.exit(1)
  }

  try {
    // Verificar se o usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    })

    if (existingUser) {
      console.log('Usuário administrador já existe')
      process.exit(0)
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Inserir usuário administrador
    await db.insert(users).values({
      name: 'Administrador',
      email,
      password: hashedPassword,
      role: 'admin',
    })

    console.log('Usuário administrador criado com sucesso')
    process.exit(0)
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error)
    process.exit(1)
  }
}

createAdminUser()
```

Execute o script para criar um usuário administrador:

```bash
pnpm tsx scripts/create-admin-user.ts

# ou usando npm script configurado no package.json
pnpm create:admin
```

## Tipos Personalizados para Next-Auth

Para melhorar a tipagem do NextAuth, crie um arquivo `types/next-auth.d.ts`:

```typescript
import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}
```

## Boas Práticas

1. **Segurança**: Use HTTPS em produção e mantenha segredos seguros
2. **JWT:** Configure um tempo de expiração adequado para tokens
3. **Sessões**: Use sessionStorage ou cookies baseados em suas necessidades de segurança
4. **Encapsulamento**: Crie hooks e componentes reutilizáveis para lógica de autenticação
5. **Controle de Acesso**: Implemente um sistema de permissões baseado em funções (RBAC)
6. **Renovação de Tokens**: Implemente renovação automática de tokens
7. **Logout**: Implemente logout completo que limpa tokens e sessões
8. **Feedback**: Forneça feedback claro aos usuários sobre erros de autenticação
