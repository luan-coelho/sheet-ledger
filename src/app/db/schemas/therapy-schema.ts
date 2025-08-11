import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const therapiesTable = pgTable('therapies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertTherapySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  active: z.boolean(),
})

export const updateTherapySchema = insertTherapySchema.partial().extend({
  id: z.string().uuid(),
})

export const selectTherapySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Therapy = typeof therapiesTable.$inferSelect
export type NewTherapy = typeof therapiesTable.$inferInsert
export type TherapyFormValues = z.infer<typeof insertTherapySchema>
export type UpdateTherapyFormValues = z.infer<typeof updateTherapySchema>
