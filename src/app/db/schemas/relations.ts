import { relations } from 'drizzle-orm'

import { professionalsTable } from './professional-schema'
import { professionalTherapiesTable } from './professional-therapy-schema'
import { therapiesTable } from './therapy-schema'

// Professional relations
export const professionalsRelations = relations(professionalsTable, ({ many }) => ({
  professionalTherapies: many(professionalTherapiesTable),
}))

// Therapy relations
export const therapiesRelations = relations(therapiesTable, ({ many }) => ({
  professionalTherapies: many(professionalTherapiesTable),
}))

// Professional Therapies junction table relations
export const professionalTherapiesRelations = relations(professionalTherapiesTable, ({ one }) => ({
  professional: one(professionalsTable, {
    fields: [professionalTherapiesTable.professionalId],
    references: [professionalsTable.id],
  }),
  therapy: one(therapiesTable, {
    fields: [professionalTherapiesTable.therapyId],
    references: [therapiesTable.id],
  }),
}))
