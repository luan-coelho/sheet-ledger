import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const healthPlansTable = pgTable('health_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertHealthPlanSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
})

export const selectHealthPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type HealthPlan = typeof healthPlansTable.$inferSelect
export type NewHealthPlan = typeof healthPlansTable.$inferInsert
export type HealthPlanFormValues = z.infer<typeof insertHealthPlanSchema>
