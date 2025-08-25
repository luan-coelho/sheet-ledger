import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { professionalsTable } from './professional-schema'

export const patientsTable = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  professionalId: uuid('professional_id').references(() => professionalsTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertPatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  professionalId: z.string().uuid('ID do profissional deve ser um UUID válido').optional(),
})

export const selectPatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  professionalId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Patient = typeof patientsTable.$inferSelect
export type NewPatient = typeof patientsTable.$inferInsert
export type PatientFormValues = z.infer<typeof insertPatientSchema>

// Tipo extendido para paciente com profissional
export type PatientWithProfessional = Patient & {
  professional?: {
    id: string
    name: string
    councilNumber: string | null
  } | null
}
