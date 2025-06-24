import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Tabela para configurações do Google Drive
export const googleDriveConfigTable = pgTable('google_drive_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountEmail: text('account_email').notNull().unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tipos inferidos
export type GoogleDriveConfig = typeof googleDriveConfigTable.$inferSelect
export type GoogleDriveConfigInsert = typeof googleDriveConfigTable.$inferInsert

// Schemas de validação
export const insertGoogleDriveConfigSchema = createInsertSchema(googleDriveConfigTable)

export const selectGoogleDriveConfigSchema = createSelectSchema(googleDriveConfigTable)

// Schema para form de configuração
export const googleDriveConfigFormSchema = z.object({
  accountEmail: z.string().email('Email inválido'),
  authorizationCode: z.string().min(1, 'Código de autorização é obrigatório'),
})

export type GoogleDriveConfigFormValues = z.infer<typeof googleDriveConfigFormSchema> 