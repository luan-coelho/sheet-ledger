import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const companiesTable = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  cnpj: text('cnpj').notNull().unique(),
  address: text('address').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertCompanySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório')
    .transform((val) => val.replace(/\D/g, '')) // Remove formatação
    .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos')
    .refine((val) => /^\d{14}$/.test(val), 'CNPJ deve conter apenas números'),
  address: z.string().min(3, 'Endereço deve ter pelo menos 3 caracteres'),
})

export const selectCompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cnpj: z.string(),
  address: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript types
export type Company = typeof companiesTable.$inferSelect
export type NewCompany = typeof companiesTable.$inferInsert
export type CompanyFormValues = z.infer<typeof insertCompanySchema>
