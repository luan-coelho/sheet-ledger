import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { therapiesTable } from './therapy-schema'

export const professionalsTable = pgTable('professionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  councilNumber: text('council_number'),
  therapyId: uuid('therapy_id').references(() => therapiesTable.id), // Relação many-to-one
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertProfessionalSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  councilNumber: z.string().optional(),
  therapyId: z.string().uuid('Selecione uma terapia').optional(),
})

export const updateProfessionalSchema = insertProfessionalSchema.partial().extend({
  id: z.string().uuid(),
})

export const selectProfessionalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  councilNumber: z.string().nullable(),
  therapyId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Professional = typeof professionalsTable.$inferSelect
export type NewProfessional = typeof professionalsTable.$inferInsert
export type ProfessionalFormValues = z.infer<typeof insertProfessionalSchema>
export type UpdateProfessionalFormValues = z.infer<typeof updateProfessionalSchema>

// Extended type for Professional with therapy details
export type ProfessionalWithTherapy = Professional & {
  therapy?: {
    id: string
    name: string
  } | null
}
