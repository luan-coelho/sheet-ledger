import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const activityLogsTable = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  action: text('action').notNull(), // SIGN_IN, SIGN_OUT, GRANT_PERMISSION, etc.
  description: text('description').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'), // JSON string para dados adicionais
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertActivityLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().min(1, 'Ação é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.string().optional(),
})

export const selectActivityLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  description: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.date(),
})

// Enum para ações predefinidas
export const ActivityActions = {
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  SPREADSHEET_GENERATED: 'SPREADSHEET_GENERATED',
  PATIENT_CREATED: 'PATIENT_CREATED',
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  PROFESSIONAL_CREATED: 'PROFESSIONAL_CREATED',
  PROFESSIONAL_UPDATED: 'PROFESSIONAL_UPDATED',
  GUARDIAN_CREATED: 'GUARDIAN_CREATED',
  GUARDIAN_UPDATED: 'GUARDIAN_UPDATED',
  HEALTH_PLAN_CREATED: 'HEALTH_PLAN_CREATED',
  HEALTH_PLAN_UPDATED: 'HEALTH_PLAN_UPDATED',
  THERAPY_CREATED: 'THERAPY_CREATED',
  THERAPY_UPDATED: 'THERAPY_UPDATED',
} as const

export type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions]

// TypeScript types
export type ActivityLog = typeof activityLogsTable.$inferSelect
export type NewActivityLog = typeof activityLogsTable.$inferInsert
export type ActivityLogFormValues = z.infer<typeof insertActivityLogSchema>

// Helper para mapear ações para descrições em português
export const ActivityActionDescriptions: Record<ActivityAction, string> = {
  SIGN_IN: 'Fez login no sistema',
  SIGN_OUT: 'Fez logout do sistema',
  USER_CREATED: 'Criou um novo usuário',
  USER_UPDATED: 'Atualizou dados de usuário',
  USER_ACTIVATED: 'Ativou um usuário',
  USER_DEACTIVATED: 'Desativou um usuário',
  PERMISSION_GRANTED: 'Concedeu permissão',
  PERMISSION_REVOKED: 'Revogou permissão',
  SPREADSHEET_GENERATED: 'Gerou uma planilha',
  PATIENT_CREATED: 'Criou um novo paciente',
  PATIENT_UPDATED: 'Atualizou dados de paciente',
  PROFESSIONAL_CREATED: 'Criou um novo profissional',
  PROFESSIONAL_UPDATED: 'Atualizou dados de profissional',
  GUARDIAN_CREATED: 'Criou um novo responsável',
  GUARDIAN_UPDATED: 'Atualizou dados de responsável',
  HEALTH_PLAN_CREATED: 'Criou um novo plano de saúde',
  HEALTH_PLAN_UPDATED: 'Atualizou dados de plano de saúde',
  THERAPY_CREATED: 'Criou uma nova terapia',
  THERAPY_UPDATED: 'Atualizou dados de terapia',
}
