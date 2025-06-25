import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail deve ter um formato válido'),
  active: z.boolean(),
})

export const updateUserSchema = insertUserSchema.partial().extend({
  id: z.string().uuid(),
})

export const selectUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
export type UserFormValues = z.infer<typeof insertUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
