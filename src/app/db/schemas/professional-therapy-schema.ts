import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { professionalsTable } from './professional-schema'
import { therapiesTable } from './therapy-schema'

export const professionalTherapiesTable = pgTable(
  'professional_therapies',
  {
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionalsTable.id, { onDelete: 'cascade' }),
    therapyId: uuid('therapy_id')
      .notNull()
      .references(() => therapiesTable.id, { onDelete: 'cascade' }),
  },
  table => ({
    pk: primaryKey({ columns: [table.professionalId, table.therapyId] }),
  }),
)

// Zod schemas for validation
export const insertProfessionalTherapySchema = z.object({
  professionalId: z.string().uuid(),
  therapyId: z.string().uuid(),
})

export const deleteProfessionalTherapySchema = z.object({
  professionalId: z.string().uuid(),
  therapyId: z.string().uuid(),
})

// TypeScript types
export type ProfessionalTherapy = typeof professionalTherapiesTable.$inferSelect
export type NewProfessionalTherapy = typeof professionalTherapiesTable.$inferInsert
