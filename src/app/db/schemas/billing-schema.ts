import { boolean, date, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { healthPlansTable } from './health-plan-schema'
import { patientsTable } from './patient-schema'
import { therapiesTable } from './therapy-schema'

export const billingStatusEnum = pgEnum('billing_status', ['pending', 'scheduled', 'sent', 'paid', 'cancelled'])

export const billingsTable = pgTable('billings', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patientsTable.id, { onDelete: 'cascade' }),
  therapyId: uuid('therapy_id').references(() => therapiesTable.id, { onDelete: 'set null' }),
  customTherapyName: text('custom_therapy_name'),
  healthPlanId: uuid('health_plan_id').references(() => healthPlansTable.id, { onDelete: 'set null' }),
  billingCycle: text('billing_cycle'),
  sessionValueCents: integer('session_value_cents').notNull().default(0),
  grossAmountCents: integer('gross_amount_cents').notNull().default(0),
  netAmountCents: integer('net_amount_cents'),
  dueDate: date('due_date'),
  invoiceIssuedAt: date('invoice_issued_at'),
  invoiceNumber: text('invoice_number'),
  competenceDate: date('competence_date'),
  billerName: text('biller_name'),
  status: billingStatusEnum('status').notNull().default('pending'),
  isBilled: boolean('is_billed').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

const currencyField = z.number({ invalid_type_error: 'Valor inválido' }).nonnegative('Valor não pode ser negativo')

const billingFormBaseSchema = z.object({
  patientId: z.string().uuid({ message: 'Paciente é obrigatório' }),
  therapyId: z.string().uuid().optional().nullable(),
  customTherapyName: z
    .string()
    .trim()
    .min(3, 'Nome da terapia deve ter pelo menos 3 caracteres')
    .max(120, 'Nome da terapia deve ter no máximo 120 caracteres')
    .optional()
    .nullable(),
  healthPlanId: z.string().uuid().optional().nullable(),
  billingCycle: z.string().trim().max(50).optional().nullable(),
  sessionValue: currencyField,
  grossAmount: currencyField,
  netAmount: currencyField.optional(),
  dueDate: z.date().optional().nullable(),
  invoiceIssuedAt: z.date().optional().nullable(),
  invoiceNumber: z.string().trim().max(60).optional().nullable(),
  competenceDate: z.date().optional().nullable(),
  billerName: z.string().trim().max(120).optional().nullable(),
  status: z.enum(['pending', 'scheduled', 'sent', 'paid', 'cancelled']).optional().default('pending'),
  isBilled: z.boolean().optional(),
  notes: z.string().trim().max(500).optional().nullable(),
})

const billingRefinements = (data: z.infer<typeof billingFormBaseSchema>, ctx: z.RefinementCtx) => {
  if (!data.therapyId && !data.customTherapyName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customTherapyName'],
      message: 'Informe uma terapia cadastrada ou descreva uma terapia manualmente',
    })
  }

  if (data.customTherapyName && data.therapyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customTherapyName'],
      message: 'Escolha uma terapia cadastrada ou informe um nome manualmente, não ambos',
    })
  }

  if (data.netAmount !== undefined && data.netAmount > data.grossAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['netAmount'],
      message: 'Valor líquido não pode ser maior que o valor bruto',
    })
  }
}

export const insertBillingSchema = billingFormBaseSchema.superRefine(billingRefinements)

export const updateBillingSchema = billingFormBaseSchema
  .partial()
  .extend({
    id: z.string().uuid({ message: 'Identificador inválido' }),
  })
  .superRefine((data, ctx) => {
    // Garantir que, mesmo parcial, mantenha consistência entre terapia e nome customizado
    const mergedData = {
      therapyId: data.therapyId ?? null,
      customTherapyName: data.customTherapyName ?? null,
      netAmount: data.netAmount,
      grossAmount: data.grossAmount ?? data.sessionValue ?? 0,
    }

    if (!mergedData.therapyId && !mergedData.customTherapyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customTherapyName'],
        message: 'Informe uma terapia cadastrada ou descreva uma terapia manualmente',
      })
    }

    if (mergedData.customTherapyName && mergedData.therapyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customTherapyName'],
        message: 'Escolha uma terapia cadastrada ou informe um nome manualmente, não ambos',
      })
    }

    if (mergedData.netAmount !== undefined && mergedData.grossAmount !== undefined) {
      if (mergedData.netAmount > mergedData.grossAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['netAmount'],
          message: 'Valor líquido não pode ser maior que o valor bruto',
        })
      }
    }
  })

export const selectBillingSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  therapyId: z.string().uuid().nullable(),
  customTherapyName: z.string().nullable(),
  healthPlanId: z.string().uuid().nullable(),
  billingCycle: z.string().nullable(),
  sessionValueCents: z.number(),
  grossAmountCents: z.number(),
  netAmountCents: z.number().nullable(),
  dueDate: z.date().nullable(),
  invoiceIssuedAt: z.date().nullable(),
  invoiceNumber: z.string().nullable(),
  competenceDate: z.date().nullable(),
  billerName: z.string().nullable(),
  status: z.enum(['pending', 'scheduled', 'sent', 'paid', 'cancelled']),
  isBilled: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Billing = typeof billingsTable.$inferSelect
export type NewBilling = typeof billingsTable.$inferInsert
export type BillingFormValues = z.infer<typeof insertBillingSchema>
export type BillingStatus = z.infer<typeof insertBillingSchema>['status']
