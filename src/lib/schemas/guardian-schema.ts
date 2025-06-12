import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const guardians = pgTable('guardians', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertGuardianSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
})

export const selectGuardianSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Guardian = typeof guardians.$inferSelect
export type NewGuardian = typeof guardians.$inferInsert
export type GuardianFormValues = z.infer<typeof insertGuardianSchema>
