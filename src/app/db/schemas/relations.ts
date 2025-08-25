import { relations } from 'drizzle-orm'

import { patientsTable } from './patient-schema'
import { professionalsTable } from './professional-schema'

// Patient relations
export const patientsRelations = relations(patientsTable, ({ one }) => ({
  professional: one(professionalsTable, {
    fields: [patientsTable.professionalId],
    references: [professionalsTable.id],
  }),
}))

// Professional relations
export const professionalsRelations = relations(professionalsTable, ({ many }) => ({
  patients: many(patientsTable),
}))
