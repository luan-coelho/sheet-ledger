import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { therapiesTable } from './therapy-schema'

/**
 * Tabela de histórico de valores de terapia por competência
 * Permite rastrear mudanças de preço ao longo do tempo
 */
export const therapyPriceHistoryTable = pgTable(
  'therapy_price_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    therapyId: uuid('therapy_id')
      .notNull()
      .references(() => therapiesTable.id, { onDelete: 'cascade' }),
    // Competência no formato YYYY-MM (ex: "2025-01", "2025-03")
    competence: text('competence').notNull(),
    // Valor em centavos para evitar problemas com ponto flutuante
    valueCents: integer('value_cents').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    // Índice único composto para garantir que não haja duplicatas de terapia + competência
    uniqueTherapyCompetence: unique('unique_therapy_competence').on(table.therapyId, table.competence),
  }),
)

// Regex para validar formato YYYY-MM
const competenceRegex = /^\d{4}-(0[1-9]|1[0-2])$/

// Zod schemas para validação
export const insertTherapyPriceHistorySchema = z.object({
  therapyId: z.string().uuid('ID da terapia inválido'),
  competence: z
    .string()
    .regex(competenceRegex, 'Competência deve estar no formato YYYY-MM (ex: 2025-01)')
    .refine(
      val => {
        const [year, month] = val.split('-').map(Number)
        const date = new Date(year, month - 1, 1)
        return date.getFullYear() === year && date.getMonth() === month - 1
      },
      { message: 'Data de competência inválida' },
    ),
  value: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser maior que zero')
    .max(999999, 'Valor muito alto'),
})

export const updateTherapyPriceHistorySchema = insertTherapyPriceHistorySchema
  .partial()
  .omit({ therapyId: true })
  .extend({
    id: z.string().uuid('ID inválido'),
  })

export const selectTherapyPriceHistorySchema = z.object({
  id: z.string().uuid(),
  therapyId: z.string().uuid(),
  competence: z.string(),
  valueCents: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schemas para queries específicas
export const getTherapyPriceByCompetenceSchema = z.object({
  therapyId: z.string().uuid('ID da terapia inválido'),
  competence: z.string().regex(competenceRegex, 'Competência deve estar no formato YYYY-MM'),
})

export const listTherapyPricesSchema = z.object({
  therapyId: z.string().uuid('ID da terapia inválido'),
  startCompetence: z.string().regex(competenceRegex, 'Competência inicial inválida').optional(),
  endCompetence: z.string().regex(competenceRegex, 'Competência final inválida').optional(),
})

// TypeScript types
export type TherapyPriceHistory = typeof therapyPriceHistoryTable.$inferSelect
export type NewTherapyPriceHistory = typeof therapyPriceHistoryTable.$inferInsert
export type TherapyPriceHistoryFormValues = z.infer<typeof insertTherapyPriceHistorySchema>
export type UpdateTherapyPriceHistoryFormValues = z.infer<typeof updateTherapyPriceHistorySchema>

// Helper type para resposta com valor formatado
export type TherapyPriceHistoryWithFormatted = TherapyPriceHistory & {
  value: number // Valor em reais (convertido de centavos)
}
