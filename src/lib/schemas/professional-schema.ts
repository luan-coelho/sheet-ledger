import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const professionals = pgTable('professionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertProfessionalSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
})

export const selectProfessionalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Professional = typeof professionals.$inferSelect
export type NewProfessional = typeof professionals.$inferInsert
export type ProfessionalFormValues = z.infer<typeof insertProfessionalSchema>
