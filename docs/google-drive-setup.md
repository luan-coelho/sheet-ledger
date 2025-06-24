# Configuração do Google Drive

Este guia descreve como configurar a integração com Google Drive para o Sheet Ledger.

## Nova Arquitetura

A partir da versão atual, o Google Drive é configurado uma única vez para toda a aplicação, ao invés de cada usuário usar sua própria conta. Isso significa:

- **Uma conta Google Drive central** para toda a aplicação
- **Usuários fazem login apenas para autenticação** (não precisam de acesso ao Drive)
- **Configuração feita pelo administrador** na página de configurações
- **Todos os usuários acessam o mesmo Drive** configurado

## Pré-requisitos

1. Conta Google Drive para a aplicação
2. Acesso ao Google Cloud Console
3. Permissões de administrador na aplicação

## Configuração no Google Cloud Console

### 1. Criar ou Selecionar Projeto

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o ID do projeto

### 2. Habilitar APIs

1. No painel lateral, vá para **APIs e Serviços** > **Biblioteca**
2. Busque e habilite as seguintes APIs:
   - **Google Drive API**
   - **Google OAuth2 API**

### 3. Configurar OAuth 2.0

1. Vá para **APIs e Serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**
3. Selecione **Aplicativo da Web**
4. Configure:
   - **Nome**: Sheet Ledger - Google Drive
   - **URIs de origem autorizados**:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (produção)
   - **URIs de redirecionamento autorizados**:
     - `http://localhost:3000/admin/settings/google-drive/callback` (desenvolvimento)
     - `https://seudominio.com/admin/settings/google-drive/callback` (produção)

### 4. Obter Credenciais

1. Após criar, você receberá:
   - **Client ID**: `123456789-abc.apps.googleusercontent.com`
   - **Client Secret**: `ABC123-def456`
2. **Importante**: Mantenha essas credenciais seguras!

## Configuração da Aplicação

### 1. Variáveis de Ambiente

Adicione ao seu arquivo `.env.local`:

```env
# Google Drive Configuration (separado das credenciais de autenticação)
GOOGLE_DRIVE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=ABC123-def456
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/admin/settings/google-drive/callback

# Para produção, altere a REDIRECT_URI para:
# GOOGLE_DRIVE_REDIRECT_URI=https://seudominio.com/admin/settings/google-drive/callback
```

### 2. Banco de Dados

Execute a migração para criar a tabela de configurações do Google Drive:

```bash
npm run db:generate
npm run db:migrate
```

## Configuração via Interface

### 1. Acesso à Configuração

1. Faça login como administrador
2. Acesse **Configurações** > **Integrações**
3. Localize a seção **Google Drive**

### 2. Autorização

#### Opção 1: Autorização Automática

1. Clique em **"Autorizar com Google"**
2. Uma nova janela abrirá para autorização
3. Faça login com a conta Google Drive da aplicação
4. Autorize as permissões solicitadas
5. A configuração será salva automaticamente

#### Opção 2: Configuração Manual

1. Clique em **"Configuração Manual"**
2. Acesse manualmente a URL de autorização do Google
3. Copie o código de autorização retornado
4. Cole o código no campo correspondente
5. Clique em **"Configurar"**

### 3. Verificação

- Após a configuração, você verá o status **"Configurado"**
- A conta Google conectada será exibida
- O Google Drive estará disponível para todos os usuários

## Uso pelos Usuários

### Acesso ao Google Drive

1. Usuários fazem login normalmente (apenas para autenticação)
2. Acessam **Google Drive** no menu lateral
3. Todos visualizam e gerenciam os mesmos arquivos da conta configurada

### Funcionalidades Disponíveis

- ✅ Navegar por pastas
- ✅ Visualizar arquivos
- ✅ Criar pastas
- ✅ Upload de arquivos
- ✅ Renomear arquivos/pastas
- ✅ Mover arquivos/pastas
- ✅ Copiar arquivos
- ✅ Excluir arquivos/pastas
- ✅ Download de arquivos
- ✅ Buscar arquivos
- ✅ Informações de armazenamento

## Segurança

### Permissões

A aplicação solicita apenas as permissões necessárias:

- **drive**: Acesso completo ao Google Drive
- **userinfo.email**: Email da conta para identificação

### Tokens

- **Access Token**: Usado para chamadas à API (renovado automaticamente)
- **Refresh Token**: Usado para renovar o access token (armazenado criptografado)
- **Expiração**: Tokens são renovados automaticamente 5 minutos antes do vencimento

### Armazenamento

- Tokens são armazenados no banco de dados da aplicação
- Apenas administradores podem configurar/remover a integração
- Logs de acesso são mantidos para auditoria

## Troubleshooting

### Erro: "Google Drive não configurado"

**Causa**: Não há configuração ativa do Google Drive
**Solução**: Configure o Google Drive na página de configurações

### Erro: "Token expirado"

**Causa**: O refresh token pode ter expirado
**Solução**: Reconfigure a integração do Google Drive

### Erro: "Permissões insuficientes"

**Causa**: A conta configurada não tem permissões no arquivo/pasta
**Solução**: Verifique as permissões da conta Google Drive configurada

### Erro: "Quota exceeded"

**Causa**: Limite de requisições da API foi atingido
**Solução**: Aguarde alguns minutos ou configure quotas maiores no Google Cloud

## Manutenção

### Renovação de Tokens

- Tokens são renovados automaticamente
- Em caso de falha, reconfigure a integração

### Monitoramento

- Verifique logs da aplicação para erros de API
- Monitore o uso de quota no Google Cloud Console

### Backup

- Configure backup regular do banco de dados
- Os tokens podem ser reconfigurados se necessário

## Migração de Versões Anteriores

Se você estava usando a versão anterior onde cada usuário tinha sua própria integração:

1. **Backup**: Faça backup dos dados importantes
2. **Reconfiguração**: Configure uma conta central conforme este guia
3. **Migração**: Mova arquivos importantes para a conta central
4. **Teste**: Verifique se todos os usuários conseguem acessar

## Suporte

Para problemas relacionados à configuração do Google Drive:

1. Verifique os logs da aplicação
2. Confirme as variáveis de ambiente
3. Teste as credenciais no Google Cloud Console
4. Verifique as permissões da conta configurada
