import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const healthPlans = pgTable('health_plans', {
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
export type HealthPlan = typeof healthPlans.$inferSelect
export type NewHealthPlan = typeof healthPlans.$inferInsert
export type HealthPlanFormValues = z.infer<typeof insertHealthPlanSchema>
