import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { healthPlansTable } from './health-plan-schema'

export const patientsTable = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  guardian: text('guardian').notNull(), // Responsável
  healthPlanId: uuid('health_plan_id').references(() => healthPlansTable.id), // Plano de saúde (opcional)
  cardNumber: text('card_number'), // N carteirinha
  guideNumber: text('guide_number'), // N guia
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertPatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  guardian: z.string().min(3, 'Nome do responsável deve ter pelo menos 3 caracteres'),
  healthPlanId: z.string().uuid().optional(),
  cardNumber: z.string().optional(),
  guideNumber: z.string().optional(),
})

export const selectPatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  guardian: z.string(),
  healthPlanId: z.string().uuid().nullable(),
  cardNumber: z.string().nullable(),
  guideNumber: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Patient = typeof patientsTable.$inferSelect
export type NewPatient = typeof patientsTable.$inferInsert
export type PatientFormValues = z.infer<typeof insertPatientSchema>
