import { desc, eq } from 'drizzle-orm'
import { google } from 'googleapis'

import { db } from '@/app/db'
import { GoogleDriveConfig, googleDriveConfigTable } from '@/app/db/schemas'

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message: string
  error?: string
}

// Configuração OAuth do Google Drive
export interface GoogleDriveOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

// Classe para gerenciar configurações do Google Drive
export class GoogleDriveConfigService {
  private oauthConfig: GoogleDriveOAuthConfig

  constructor() {
    this.oauthConfig = {
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
      redirectUri: `${process.env.NEXT_PUBLIC_URL}/admin/settings/google-drive/callback`,
    }
  }

  // Gerar URL de autorização
  generateAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      this.oauthConfig.clientId,
      this.oauthConfig.clientSecret,
      this.oauthConfig.redirectUri,
    )

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
      state: 'google-drive-config', // Identificador único para nosso fluxo
    })
  }

  // Trocar código de autorização por tokens
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: Date
    email: string
  }> {
    try {
      // Verificar se as credenciais estão configuradas
      if (!this.oauthConfig.clientId || !this.oauthConfig.clientSecret) {
        throw new Error('Credenciais OAuth não configuradas. Verifique AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET.')
      }

      const oauth2Client = new google.auth.OAuth2(
        this.oauthConfig.clientId,
        this.oauthConfig.clientSecret,
        this.oauthConfig.redirectUri,
      )

      const { tokens } = await oauth2Client.getToken(code)

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Tokens não recebidos do Google')
      }

      // Obter informações do usuário
      oauth2Client.setCredentials(tokens)
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const userInfo = await oauth2.userinfo.get()

      const expiresAt = new Date()
      if (tokens.expiry_date) {
        expiresAt.setTime(tokens.expiry_date)
      } else {
        expiresAt.setTime(Date.now() + 3600 * 1000) // 1 hora
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        email: userInfo.data.email || '',
      }
    } catch (error: unknown) {
      console.error('❌ Erro detalhado ao trocar código por tokens:', error)

      // Tratar erros específicos do Google OAuth
      const errorObj = error as {
        code?: number
        message?: string
        response?: {
          data?: {
            error?: string
            error_description?: string
          }
        }
      }

      // Log detalhado do erro
      if (errorObj.response?.data) {
        console.error('Resposta do Google:', errorObj.response.data)
      }

      // Tratar diferentes tipos de erro invalid_grant
      if (errorObj.code === 400 || errorObj.message?.includes('invalid_grant')) {
        const errorDescription = errorObj.response?.data?.error_description || ''

        if (errorDescription.includes('expired')) {
          throw new Error(
            'Código de autorização expirado. O código OAuth expira em alguns minutos. Solicite um novo código.',
          )
        }

        if (errorDescription.includes('used')) {
          throw new Error(
            'Código de autorização já foi usado. Cada código só pode ser usado uma vez. Solicite um novo código.',
          )
        }

        if (errorDescription.includes('redirect_uri_mismatch')) {
          throw new Error(
            `URL de redirecionamento não confere. Verifique se '${this.oauthConfig.redirectUri}' está registrada no Google Cloud Console.`,
          )
        }

        throw new Error(
          'Código de autorização inválido. Verifique se a URL de callback está correta no Google Cloud Console e solicite um novo código.',
        )
      }

      if (errorObj.message?.includes('invalid_client')) {
        throw new Error(
          'Credenciais do Google inválidas. Verifique se CLIENT_ID e CLIENT_SECRET estão corretos no Google Cloud Console.',
        )
      }

      if (errorObj.message?.includes('redirect_uri_mismatch')) {
        throw new Error(
          `URL de redirecionamento inválida. Registre '${this.oauthConfig.redirectUri}' no Google Cloud Console.`,
        )
      }

      throw new Error(`Erro na autorização OAuth: ${errorObj.message || 'Erro desconhecido'}`)
    }
  }

  // Salvar configuração no banco
  async saveConfig(config: {
    accountEmail: string
    accessToken: string
    refreshToken: string
    expiresAt: Date
  }): Promise<GoogleDriveConfig> {
    // Desativar todas as configurações existentes
    await db
      .update(googleDriveConfigTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(googleDriveConfigTable.isActive, true))

    // Verificar se já existe uma configuração para este email
    const [existingConfig] = await db
      .select()
      .from(googleDriveConfigTable)
      .where(eq(googleDriveConfigTable.accountEmail, config.accountEmail))
      .limit(1)

    if (existingConfig) {
      // Atualizar configuração existente
      const [updatedConfig] = await db
        .update(googleDriveConfigTable)
        .set({
          accessToken: config.accessToken,
          refreshToken: config.refreshToken,
          expiresAt: config.expiresAt,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(googleDriveConfigTable.id, existingConfig.id))
        .returning()

      return updatedConfig
    } else {
      // Inserir nova configuração
      const [newConfig] = await db
        .insert(googleDriveConfigTable)
        .values({
          accountEmail: config.accountEmail,
          accessToken: config.accessToken,
          refreshToken: config.refreshToken,
          expiresAt: config.expiresAt,
          isActive: true,
        })
        .returning()

      return newConfig
    }
  }

  // Obter configuração ativa
  async getActiveConfig(): Promise<GoogleDriveConfig | null> {
    const [config] = await db
      .select()
      .from(googleDriveConfigTable)
      .where(eq(googleDriveConfigTable.isActive, true))
      .orderBy(desc(googleDriveConfigTable.createdAt))
      .limit(1)

    return config || null
  }

  // Refresh token se necessário
  async refreshTokenIfNeeded(config: GoogleDriveConfig): Promise<GoogleDriveConfig> {
    const now = new Date()
    const expirationBuffer = 5 * 60 * 1000 // 5 minutos de buffer

    // Verificar se o token precisa ser renovado
    if (config.expiresAt.getTime() - now.getTime() > expirationBuffer) {
      return config // Token ainda válido
    }

    const oauth2Client = new google.auth.OAuth2(
      this.oauthConfig.clientId,
      this.oauthConfig.clientSecret,
      this.oauthConfig.redirectUri,
    )

    oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    })

    try {
      const { credentials } = await oauth2Client.refreshAccessToken()

      if (!credentials.access_token) {
        throw new Error('Novo token de acesso não recebido')
      }

      const newExpiresAt = new Date()
      if (credentials.expiry_date) {
        newExpiresAt.setTime(credentials.expiry_date)
      } else {
        newExpiresAt.setTime(Date.now() + 3600 * 1000)
      }

      // Atualizar no banco
      const [updatedConfig] = await db
        .update(googleDriveConfigTable)
        .set({
          accessToken: credentials.access_token,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(googleDriveConfigTable.id, config.id))
        .returning()

      return updatedConfig
    } catch (error) {
      console.error('Erro ao renovar token:', error)

      // Verificar se é erro invalid_grant
      const errorObj = error as {
        message?: string
        response?: {
          data?: {
            error?: string
          }
        }
      }

      const isInvalidGrant =
        errorObj.message?.includes('invalid_grant') || errorObj.response?.data?.error === 'invalid_grant'

      if (isInvalidGrant) {
        console.log('Token inválido detectado. Removendo configuração atual para forçar nova autorização.')

        // Remover configuração atual silenciosamente
        await this.removeConfig()

        // Retornar erro específico para indicar que nova autorização é necessária
        throw new Error('REAUTH_REQUIRED')
      }

      throw new Error('Falha ao renovar token. Reconfiguração necessária.')
    }
  }

  // Obter token válido para usar na API
  async getValidAccessToken(): Promise<string> {
    const config = await this.getActiveConfig()

    if (!config) {
      throw new Error('Google Drive não configurado')
    }

    try {
      const updatedConfig = await this.refreshTokenIfNeeded(config)
      return updatedConfig.accessToken
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

      if (errorMessage === 'REAUTH_REQUIRED') {
        throw new Error('REAUTH_REQUIRED')
      }

      throw error
    }
  }

  // Remover configuração
  async removeConfig(): Promise<void> {
    await db
      .update(googleDriveConfigTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(googleDriveConfigTable.isActive, true))
  }

  // Verificar status da configuração
  async getConfigStatus(): Promise<{
    isConfigured: boolean
    accountEmail?: string
    configuredAt?: Date
  }> {
    const config = await this.getActiveConfig()

    return {
      isConfigured: !!config,
      accountEmail: config?.accountEmail,
      configuredAt: config?.createdAt,
    }
  }
}

// Instância singleton
export const googleDriveConfigService = new GoogleDriveConfigService()
