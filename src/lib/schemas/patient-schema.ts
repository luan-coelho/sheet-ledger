import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertPatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
})

export const selectPatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Patient = typeof patients.$inferSelect
export type NewPatient = typeof patients.$inferInsert
export type PatientFormValues = z.infer<typeof insertPatientSchema>
