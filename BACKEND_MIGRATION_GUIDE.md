# Sheet Ledger - Documentação da API Backend

Este documento fornece uma análise completa da API backend da aplicação Next.js Sheet Ledger para facilitar a migração para um backend Java com Hibernate e Quarkus.

## Visão Geral do Sistema

O Sheet Ledger é um sistema de gestão de atendimentos terapêuticos que permite:

- Gerenciar pacientes, profissionais, terapias e planos de saúde
- Gerar planilhas de registro de atendimentos
- Integração com Google Drive para armazenamento de arquivos
- Sistema de autenticação e logs de atividades
- Gestão de empresas/clínicas

## Arquitetura de Dados

### Entidades Principais

#### 1. **User** (Usuário)

```sql
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome do usuário (mín. 2 caracteres)
- `email`: String - Email único (validação de formato)
- `active`: Boolean - Status ativo/inativo (default: true)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Validações:**

- Nome deve ter pelo menos 2 caracteres
- Email deve ter formato válido
- Email deve ser único no sistema

#### 2. **Company** (Empresa/Clínica)

```sql
CREATE TABLE "companies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "cnpj" text NOT NULL UNIQUE,
    "address" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome da empresa (mín. 3 caracteres)
- `cnpj`: String - CNPJ único (14 dígitos, apenas números)
- `address`: String - Endereço (mín. 3 caracteres)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Validações:**

- Nome deve ter pelo menos 3 caracteres
- CNPJ deve ter exatamente 14 dígitos numéricos
- CNPJ deve ser único no sistema
- Endereço deve ter pelo menos 3 caracteres

#### 3. **Therapy** (Terapia)

```sql
CREATE TABLE "therapies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome da terapia (mín. 3 caracteres)
- `active`: Boolean - Status ativo/inativo (default: true)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Validações:**

- Nome deve ter pelo menos 3 caracteres

#### 4. **HealthPlan** (Plano de Saúde)

```sql
CREATE TABLE "health_plans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome do plano de saúde (mín. 3 caracteres)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Validações:**

- Nome deve ter pelo menos 3 caracteres

#### 5. **Professional** (Profissional)

```sql
CREATE TABLE "professionals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "council_number" text,
    "therapy_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    FOREIGN KEY ("therapy_id") REFERENCES "therapies"("id")
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome do profissional (mín. 3 caracteres)
- `councilNumber`: String - Número do conselho (opcional)
- `therapyId`: UUID - Referência para terapia (opcional)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Relacionamentos:**

- **Many-to-One** com `Therapy` (um profissional pode ter uma terapia principal)

**Validações:**

- Nome deve ter pelo menos 3 caracteres
- Se therapyId for fornecido, deve ser um UUID válido

#### 6. **Patient** (Paciente)

```sql
CREATE TABLE "patients" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "guardian" text NOT NULL,
    "health_plan_id" uuid,
    "card_number" text,
    "guide_number" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    FOREIGN KEY ("health_plan_id") REFERENCES "health_plans"("id")
);
```

**Campos:**

- `id`: UUID - Identificador único
- `name`: String - Nome do paciente (mín. 3 caracteres)
- `guardian`: String - Nome do responsável (mín. 3 caracteres)
- `healthPlanId`: UUID - Referência para plano de saúde (opcional)
- `cardNumber`: String - Número da carteirinha (opcional)
- `guideNumber`: String - Número da guia (opcional)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

**Relacionamentos:**

- **Many-to-One** com `HealthPlan` (um paciente pode ter um plano de saúde)

**Validações:**

- Nome deve ter pelo menos 3 caracteres
- Nome do responsável deve ter pelo menos 3 caracteres

#### 7. **ActivityLog** (Log de Atividades)

```sql
CREATE TABLE "activity_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "action" text NOT NULL,
    "description" text NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `userId`: UUID - Referência para usuário
- `action`: String - Tipo de ação (enum definido)
- `description`: String - Descrição da ação
- `ipAddress`: String - Endereço IP (opcional)
- `userAgent`: String - User Agent do navegador (opcional)
- `metadata`: String - JSON com dados adicionais (opcional)
- `createdAt`: Timestamp - Data/hora da ação

**Ações Predefinidas (Enum):**

```typescript
enum ActivityActions {
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  SPREADSHEET_GENERATED = 'SPREADSHEET_GENERATED',
  GOOGLE_DRIVE_CONNECTED = 'GOOGLE_DRIVE_CONNECTED',
  PATIENT_CREATED = 'PATIENT_CREATED',
  PATIENT_UPDATED = 'PATIENT_UPDATED',
  PROFESSIONAL_CREATED = 'PROFESSIONAL_CREATED',
}
```

#### 8. **GoogleDriveConfig** (Configuração Google Drive)

```sql
CREATE TABLE "google_drive_config" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "account_email" text NOT NULL UNIQUE,
    "access_token" text NOT NULL,
    "refresh_token" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Campos:**

- `id`: UUID - Identificador único
- `accountEmail`: String - Email da conta Google (único)
- `accessToken`: String - Token de acesso OAuth2
- `refreshToken`: String - Token de refresh OAuth2
- `expiresAt`: Timestamp - Data de expiração do token
- `isActive`: Boolean - Status ativo/inativo (default: true)
- `createdAt`, `updatedAt`: Timestamp - Controle de auditoria

## Endpoints da API

### 1. **Autenticação** (`/api/auth`)

#### GET/POST `/api/auth/[...nextauth]`

- **Função**: Gerencia autenticação via NextAuth.js
- **Métodos**: GET, POST
- **Implementação Java**: Implementar JWT/OAuth2 com Spring Security ou similar

### 2. **Empresas** (`/api/companies`)

#### GET `/api/companies`

- **Função**: Lista todas as empresas
- **Resposta**: Array de empresas ordenadas por data de criação (desc)
- **Autenticação**: Não requerida
- **Estrutura de Resposta**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "cnpj": "string",
      "address": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "message": "Companies listed successfully"
}
```

#### POST `/api/companies`

- **Função**: Cria nova empresa
- **Body**:

```json
{
  "name": "string (min 3)",
  "cnpj": "string (14 digits)",
  "address": "string (min 3)"
}
```

- **Validações**: Zod schema (insertCompanySchema)
- **Resposta**: Empresa criada (status 201)

#### GET `/api/companies/[id]`

- **Função**: Busca empresa por ID
- **Parâmetros**: id (UUID)
- **Resposta**: Dados da empresa ou erro 404

#### PUT `/api/companies/[id]`

- **Função**: Atualiza empresa
- **Body**: Mesmo do POST
- **Validações**: Verifica se existe antes de atualizar

#### DELETE `/api/companies/[id]`

- **Função**: Remove empresa
- **Validações**: Verifica se existe antes de remover

### 3. **Pacientes** (`/api/patients`)

#### GET `/api/patients`

- **Função**: Lista todos os pacientes ordenados por nome (asc)
- **Estrutura**: Similar às empresas

#### POST `/api/patients`

- **Body**:

```json
{
  "name": "string (min 3)",
  "guardian": "string (min 3)",
  "healthPlanId": "uuid (optional)",
  "cardNumber": "string (optional)",
  "guideNumber": "string (optional)"
}
```

#### GET/PUT/DELETE `/api/patients/[id]`

- **Funções**: CRUD básico similar às empresas

### 4. **Profissionais** (`/api/professionals`)

#### GET `/api/professionals`

- **Função**: Lista profissionais com dados da terapia (LEFT JOIN)
- **Resposta**: Inclui dados relacionados da terapia

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "councilNumber": "string",
      "therapyId": "uuid",
      "therapy": {
        "id": "uuid",
        "name": "string"
      },
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

#### POST `/api/professionals`

- **Body**:

```json
{
  "name": "string (min 3)",
  "councilNumber": "string (optional)",
  "therapyId": "uuid (optional)"
}
```

### 5. **Terapias** (`/api/therapies`)

#### GET `/api/therapies`

- **Função**: Lista terapias ordenadas por data de criação (desc)
- **Resposta**: Array simples (sem wrapper success/data)

#### POST `/api/therapies`

- **Body**:

```json
{
  "name": "string (min 3)",
  "active": "boolean"
}
```

### 6. **Planos de Saúde** (`/api/health-plans`)

#### GET/POST `/api/health-plans`

- **Função**: CRUD básico similar às outras entidades
- **Body POST**:

```json
{
  "name": "string (min 3)"
}
```

### 7. **Usuários** (`/api/users`)

#### GET `/api/users`

- **Função**: Lista usuários (requer autenticação)
- **Autenticação**: Necessária
- **Ordenação**: Por nome (asc)

#### POST `/api/users`

- **Função**: Cria usuário (requer autenticação)
- **Validações**:
  - Email único
  - Usuário autenticado
- **Body**:

```json
{
  "name": "string (min 2)",
  "email": "string (valid email)",
  "active": "boolean"
}
```

#### PATCH `/api/users/[id]/toggle-status`

- **Função**: Alterna status ativo/inativo do usuário
- **Validações**:
  - Usuário não pode desativar a própria conta
  - Usuário deve existir
- **Body**:

```json
{
  "active": "boolean"
}
```

### 8. **Logs de Atividades** (`/api/activity-logs`)

#### GET `/api/activity-logs`

- **Função**: Lista logs com paginação e filtros
- **Autenticação**: Necessária
- **Parâmetros de Query**:
  - `userId`: UUID (opcional)
  - `action`: String (opcional)
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
- **Funcionalidades**:
  - JOIN com tabela users para nome/email
  - Paginação
  - Filtros por usuário e ação
  - Captura de IP e User-Agent

#### POST `/api/activity-logs`

- **Função**: Cria novo log de atividade
- **Body**:

```json
{
  "userId": "uuid",
  "action": "string",
  "description": "string",
  "ipAddress": "string (optional)",
  "userAgent": "string (optional)",
  "metadata": "string (optional, JSON)"
}
```

### 9. **Geração de Planilhas**

#### POST `/api/generate-spreadsheet`

- **Função**: Gera planilha Excel de registro de atendimentos
- **Campos Obrigatórios**:
  - `professional`: String
  - `licenseNumber`: String
  - `patientName`: String
  - `responsible`: String
  - `healthPlan`: String
  - `weekDaySessions`: Array<WeekdaySession>
  - `startTime`: String
  - `endTime`: String
- **Campos Opcionais**:
  - `authorizedSession`: String
  - `cardNumber`: String
  - `guideNumber`: String
  - `therapy`: String
  - `companyData`: Object (name, cnpj, address)
- **Resposta**: Arquivo Excel (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

#### POST `/api/generate-spreadsheet-multi`

- **Função**: Gera múltiplas planilhas (ZIP) para períodos multi-mês
- **Lógica**: Se período > 1 mês, gera ZIP com uma planilha por mês

#### POST `/api/generate-spreadsheet-drive`

- **Função**: Gera planilhas e salva diretamente no Google Drive
- **Funcionalidades**:
  - Cria estrutura de pastas por paciente
  - Upload automático para Google Drive
  - Verificação de arquivos existentes
  - Processamento por mês individual

### 10. **Google Drive** (`/api/google-drive`)

#### GET `/api/google-drive-config`

- **Função**: Obtém status da configuração do Google Drive
- **Autenticação**: Necessária

#### POST `/api/google-drive-config`

- **Função**: Configura integração com Google Drive
- **Body**:

```json
{
  "code": "string (authorization code)"
}
```

#### DELETE `/api/google-drive-config`

- **Função**: Remove configuração do Google Drive

#### GET `/api/google-drive-config/auth-url`

- **Função**: Obtém URL de autorização OAuth2 do Google

#### GET `/api/google-drive/files`

- **Função**: Lista arquivos/pastas do Google Drive
- **Query Params**:
  - `folderId`: String (opcional)
  - `pageSize`: Number (default: 100)

#### POST `/api/google-drive/files`

- **Função**: Cria arquivo ou pasta no Google Drive
- **Body**:

```json
{
  "type": "folder|file",
  "name": "string",
  "parents": "array",
  "content": "string (if file)",
  "mimeType": "string (if file)"
}
```

#### GET `/api/google-drive/search`

- **Função**: Busca arquivos no Google Drive

#### GET `/api/google-drive/storage`

- **Função**: Obtém informações de armazenamento

## Estruturas de Dados Complexas

### WeekdaySession

```typescript
interface WeekdaySession {
  day: WeekDays
  sessions: number
  startTime?: string
  endTime?: string
}

enum WeekDays {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
```

### CompanyData

```typescript
interface CompanyData {
  name: string
  cnpj: string
  address: string
}
```

## Padrões de Resposta da API

### Resposta de Sucesso (Padrão)

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": "error_type",
  "message": "string",
  "details": "string (optional)"
}
```

### Status HTTP

- **200**: Sucesso
- **201**: Criado
- **400**: Dados inválidos (Zod validation)
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **409**: Conflito (email duplicado, etc.)
- **500**: Erro interno do servidor

## Considerações para Implementação Java/Quarkus

### 1. **Dependências Necessárias**

- Quarkus REST (JAX-RS)
- Quarkus Hibernate ORM with Panache
- PostgreSQL driver
- Bean Validation
- Jackson JSON
- Quarkus Security (JWT)
- Apache POI (para geração Excel)
- Google Drive API client

### 2. **Estrutura Recomendada**

```
src/main/java/
├── entity/          # Entidades JPA
├── repository/      # Repositórios Panache
├── resource/        # Endpoints REST
├── service/         # Lógica de negócio
├── dto/            # DTOs para requests/responses
├── config/         # Configurações
├── security/       # Autenticação/Autorização
└── util/           # Utilitários
```

### 3. **Anotações JPA Importantes**

- `@Entity`, `@Table`
- `@Id`, `@GeneratedValue`
- `@ManyToOne`, `@OneToMany`
- `@Column(unique = true)` para emails e CNPJs
- `@CreationTimestamp`, `@UpdateTimestamp`
- `@Valid` para validação

### 4. **Bean Validation**

- `@NotNull`, `@NotBlank`
- `@Size(min = 3)` para campos de texto
- `@Email` para validação de email
- `@Pattern` para CNPJ (14 dígitos)
- Grupos de validação para diferentes operações

### 5. **Segurança**

- JWT para autenticação stateless
- Roles/authorities para diferentes tipos de usuário
- Proteção de endpoints sensíveis
- CORS configurado adequadamente

### 6. **Funcionalidades Especiais**

- **ExcelService**: Implementar com Apache POI para geração de planilhas
- **GoogleDriveService**: Cliente OAuth2 para integração
- **ActivityLogService**: Interceptor/Filter para logs automáticos
- **ValidationService**: Validação de CNPJ customizada

### 7. **Configurações Importantes**

- Database migrations (Flyway)
- Connection pool configuration
- Google OAuth2 credentials
- File upload limits
- CORS policies

Esta documentação fornece toda a estrutura necessária para recriar o backend em Java com Quarkus, mantendo a compatibilidade com o frontend existente e preservando todas as funcionalidades atuais.
