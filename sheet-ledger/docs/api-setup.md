# Configuração de APIs RESTful e React Query

Este guia cobre a implementação e gerenciamento de APIs RESTful no projeto utilizando React Query para o gerenciamento de estado do servidor.

## Pré-requisitos

- Next.js (App Router)
- TypeScript
- React Query / TanStack Query

## Instalação das Dependências

```bash
# Instalar React Query
pnpm add @tanstack/react-query@latest

# Instalar React Query Devtools (opcional, para desenvolvimento)
pnpm add -D @tanstack/react-query-devtools@latest
```

## Configuração do React Query

### Configuração do Provider

Crie um componente Provider para o React Query em `src/components/query-provider.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Adicionando o Provider no Layout Raiz

Adicione o `QueryProvider` ao layout raiz da aplicação em `src/app/layout.tsx`:

```tsx
import { QueryProvider } from '@/components/query-provider'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={/* ... */}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Estrutura de APIs

### Organização de Arquivos

Organize suas APIs da seguinte forma:

```
src/
  ├── app/
  │   └── api/
  │       ├── [resource]/        # Nome do recurso (patients, professionals, etc)
  │       │   ├── route.ts       # Handlers para coleção (GET, POST)
  │       │   └── [id]/
  │       │       └── route.ts   # Handlers para item único (GET, PUT, DELETE)
  │       └── [outra-resource]/
  │
  ├── services/                  # Serviços de comunicação com a API
  │   ├── patient-service.ts
  │   └── professional-service.ts
  │
  └── hooks/                     # Hooks personalizados para React Query
      ├── use-patients.ts
      └── use-professionals.ts
```

### Implementação de Rotas de API

Exemplo de uma rota de API para recursos:

```typescript
// src/app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { patients } from '@/db/schemas/patient-schema'
import { eq } from 'drizzle-orm'

// Listar todos os pacientes
export async function GET() {
  try {
    const allPatients = await db.query.patients.findMany({
      with: {
        guardian: true,
        healthPlan: true,
      },
    })

    return NextResponse.json(allPatients)
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 })
  }
}

// Criar um novo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newPatient = await db
      .insert(patients)
      .values({
        name: body.name,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        guardianId: body.guardianId,
        healthPlanId: body.healthPlanId,
      })
      .returning()

    return NextResponse.json(newPatient[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar paciente:', error)
    return NextResponse.json({ error: 'Erro ao criar paciente' }, { status: 500 })
  }
}
```

Exemplo de uma rota de API para um recurso específico:

```typescript
// src/app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { patients } from '@/db/schemas/patient-schema'
import { eq } from 'drizzle-orm'

// Obter um paciente específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)

    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, id),
      with: {
        guardian: true,
        healthPlan: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json({ error: 'Erro ao buscar paciente' }, { status: 500 })
  }
}

// Atualizar um paciente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const updated = await db
      .update(patients)
      .set({
        name: body.name,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        guardianId: body.guardianId,
        healthPlanId: body.healthPlanId,
      })
      .where(eq(patients.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar paciente' }, { status: 500 })
  }
}

// Excluir um paciente
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)

    const deleted = await db.delete(patients).where(eq(patients.id, id)).returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir paciente:', error)
    return NextResponse.json({ error: 'Erro ao excluir paciente' }, { status: 500 })
  }
}
```

## Implementação de Serviços

Crie serviços para encapsular a lógica de comunicação com a API:

```typescript
// src/services/patient-service.ts
import { Patient, NewPatient, PatientUpdate } from '@/types'

// Buscar todos os pacientes
export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch(routes.backend.patients)

  if (!response.ok) {
    throw new Error('Erro ao buscar pacientes')
  }

  return response.json()
}

// Buscar um paciente específico
export async function fetchPatientById(id: number): Promise<Patient> {
  const response = await fetch(`${routes.backend.patients}/${id}`)

  if (!response.ok) {
    throw new Error('Erro ao buscar paciente')
  }

  return response.json()
}

// Criar um novo paciente
export async function createPatient(data: NewPatient): Promise<Patient> {
  const response = await fetch(routes.backend.patients, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Erro ao criar paciente')
  }

  return response.json()
}

// Atualizar um paciente
export async function updatePatient(id: number, data: PatientUpdate): Promise<Patient> {
  const response = await fetch(`${routes.backend.patients}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Erro ao atualizar paciente')
  }

  return response.json()
}

// Excluir um paciente
export async function deletePatient(id: number): Promise<void> {
  const response = await fetch(`${routes.backend.patients}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Erro ao excluir paciente')
  }
}
```

## Implementação de Hooks React Query

Crie hooks personalizados para usar os serviços com React Query:

```typescript
// src/hooks/use-patients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPatients,
  fetchPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/services/patient-service'
import { Patient, NewPatient, PatientUpdate } from '@/types'

// Hook para buscar todos os pacientes
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  })
}

// Hook para buscar um paciente específico
export function usePatient(id: number) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => fetchPatientById(id),
    enabled: !!id, // Só executa se o ID for válido
  })
}

// Hook para criar um novo paciente
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NewPatient) => createPatient(data),
    onSuccess: newPatient => {
      // Atualiza a cache de pacientes
      queryClient.invalidateQueries({ queryKey: ['patients'] })

      // Adiciona o novo paciente à cache
      queryClient.setQueryData(['patients', newPatient.id], newPatient)
    },
  })
}

// Hook para atualizar um paciente
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientUpdate }) => updatePatient(id, data),
    onSuccess: updatedPatient => {
      // Atualiza a cache do paciente específico
      queryClient.setQueryData(['patients', updatedPatient.id], updatedPatient)

      // Invalida a cache da lista para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

// Hook para excluir um paciente
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: (_, variables) => {
      // Remove o paciente da cache
      queryClient.removeQueries({ queryKey: ['patients', variables] })

      // Invalida a cache da lista para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
```

## Usando os Hooks nos Componentes

Exemplo de uso dos hooks em um componente:

```tsx
// src/components/patient-form.tsx
'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreatePatient, useUpdatePatient } from '@/hooks/use-patients'

// Schema de validação
const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  dateOfBirth: z.string().optional(),
  guardianId: z.number().optional().nullable(),
  healthPlanId: z.number().optional().nullable(),
})

// Derivar tipos do schema
type FormValues = z.infer<typeof formSchema>

interface PatientFormProps {
  initialData?: FormValues
  patientId?: number
  onSuccess?: () => void
}

export function PatientForm({ initialData, patientId, onSuccess }: PatientFormProps) {
  const createPatientMutation = useCreatePatient()
  const updatePatientMutation = useUpdatePatient()

  const isEditing = !!patientId

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      dateOfBirth: '',
      guardianId: null,
      healthPlanId: null,
    },
  })

  const isLoading = createPatientMutation.isPending || updatePatientMutation.isPending

  function onSubmit(values: FormValues) {
    if (isEditing) {
      updatePatientMutation.mutate(
        { id: patientId, data: values },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        },
      )
    } else {
      createPatientMutation.mutate(values, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Outros campos do formulário */}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </form>
    </Form>
  )
}
```

## Tratamento de Erros

Implemente um tratamento de erros consistente:

```typescript
// src/lib/api-utils.ts
export class ApiError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json()
      throw new ApiError(errorData.error || 'Ocorreu um erro', response.status)
    } else {
      throw new ApiError(`Erro ${response.status}: ${response.statusText}`, response.status)
    }
  }

  // Retorna null para respostas 204 No Content
  if (response.status === 204) {
    return null as T
  }

  // Retorna o body parseado para outras respostas
  return isJson ? response.json() : (response.text() as unknown as T)
}
```

## Implementação de Paginação, Filtros e Ordenação

Exemplo de implementação de paginação, filtros e ordenação:

```typescript
// src/app/api/patients/route.ts (com paginação e filtros)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { patients } from '@/db/schemas/patient-schema'
import { eq, like, desc, asc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const orderBy = searchParams.get('orderBy') || 'name'
    const orderDir = searchParams.get('orderDir') || 'asc'

    // Calcular offset para paginação
    const offset = (page - 1) * limit

    // Construir query
    let query = db.select().from(patients)

    // Aplicar filtro de pesquisa
    if (search) {
      query = query.where(like(patients.name, `%${search}%`))
    }

    // Aplicar ordenação
    const orderColumn = patients[orderBy] || patients.name
    if (orderDir === 'desc') {
      query = query.orderBy(desc(orderColumn))
    } else {
      query = query.orderBy(asc(orderColumn))
    }

    // Aplicar paginação
    query = query.limit(limit).offset(offset)

    // Executar consulta
    const results = await query

    // Contar total de registros para metadados de paginação
    const totalQuery = db.select({ count: count() }).from(patients)

    if (search) {
      totalQuery.where(like(patients.name, `%${search}%`))
    }

    const [{ count: total }] = await totalQuery

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      data: results,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 })
  }
}
```

Hook para consumir API paginada:

```typescript
// src/hooks/use-patients.ts (com paginação e filtros)
interface PaginationParams {
  page: number
  limit: number
  search?: string
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export function usePaginatedPatients(params: PaginationParams) {
  return useQuery({
    queryKey: ['patients', 'paginated', params],
    queryFn: () => {
      const searchParams = new URLSearchParams()
      searchParams.set('page', params.page.toString())
      searchParams.set('limit', params.limit.toString())

      if (params.search) {
        searchParams.set('search', params.search)
      }

      if (params.orderBy) {
        searchParams.set('orderBy', params.orderBy)
      }

      if (params.orderDir) {
        searchParams.set('orderDir', params.orderDir)
      }

      return fetch(`${routes.backend.patients.list}?${searchParams.toString()}`).then(handleResponse)
    },
  })
}
```

## Boas Práticas

1. **Organização de API:** Estruture sua API seguindo padrões RESTful
2. **Desempenho:** Configure corretamente `staleTime` e `cacheTime` para otimizar requisições
3. **Erros:** Implemente tratamento de erros consistente com feedback ao usuário
4. **Cache:** Utilize o gerenciamento de cache do React Query para otimizar a experiência
5. **Paginação:** Implemente paginação para grandes conjuntos de dados
6. **Types:** Mantenha tipagem consistente entre cliente e servidor
7. **Segurança:** Valide dados no servidor, não confie apenas na validação do cliente
8. **Testes:** Escreva testes para seus serviços e hooks
9. **SSR:** Utilize `initialData` do React Query para combinar SSR com React Query
10. **DevTools:** Use React Query DevTools durante o desenvolvimento para depurar
