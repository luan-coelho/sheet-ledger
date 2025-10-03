import { z } from 'zod'

export enum WeekDays {
  MONDAY = 'Segunda-feira',
  TUESDAY = 'Terça-feira',
  WEDNESDAY = 'Quarta-feira',
  THURSDAY = 'Quinta-feira',
  FRIDAY = 'Sexta-feira',
  SATURDAY = 'Sábado',
  SUNDAY = 'Domingo',
}

export const meses = [
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
]

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

// Type for weekday sessions configuration
export type WeekdaySession = {
  day: WeekDays
  sessions: number
  startTime?: string
  endTime?: string
}

export type DateOverride = {
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  sessions?: number
}

const dateOverrideSchema = z
  .object({
    startDate: z.string().min(1, 'Data inicial obrigatória'),
    endDate: z.string().optional(),
    startTime: z
      .string({ required_error: 'Horário inicial obrigatório' })
      .min(1, 'Horário inicial obrigatório')
      .refine(value => timeRegex.test(value), 'Formato de horário inválido (HH:MM)'),
    endTime: z
      .string({ required_error: 'Horário final obrigatório' })
      .min(1, 'Horário final obrigatório')
      .refine(value => timeRegex.test(value), 'Formato de horário inválido (HH:MM)'),
    sessions: z
      .number({ invalid_type_error: 'Informe o número de sessões' })
      .int('Informe um número inteiro de sessões')
      .min(1, 'Mínimo 1 sessão')
      .max(10, 'Máximo 10 sessões')
      .optional(),
  })
  .refine(data => {
    const { startTime, endTime } = data
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startInMinutes = startHour * 60 + startMinute
    const endInMinutes = endHour * 60 + endMinute

    return endInMinutes > startInMinutes
  }, 'Horário final deve ser posterior ao horário inicial')
  .refine(data => {
    if (!data.endDate) return true

    const startDate = new Date(data.startDate + 'T00:00:00')
    const endDate = new Date(data.endDate + 'T00:00:00')

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false

    return endDate >= startDate
  }, 'Data final deve ser posterior ou igual à data inicial')

export const spreadsheetFormSchema = z
  .object({
    professionalId: z.string().uuid('Selecione um profissional'),
    licenseNumber: z.string().min(1, 'Nº conselho do profissional'),
    authorizedSession: z.string().optional(),
    patientId: z.string().uuid('Selecione um paciente'),
    guardian: z.string().min(1, 'Nome do responsável é obrigatório'),
    companyId: z.string().uuid('Selecione uma empresa'),
    healthPlanId: z.string().uuid('Selecione um plano de saúde'),
    therapyId: z.string().uuid('Selecione uma terapia'),
    cardNumber: z.string().optional(),
    guideNumber: z.string().optional(),
    weekDaySessions: z
      .array(
        z.object({
          day: z.nativeEnum(WeekDays),
          sessions: z.number().min(1, 'Mínimo 1 sessão').max(10, 'Máximo 10 sessões'),
          startTime: z
            .string()
            .optional()
            .refine(value => !value || timeRegex.test(value), 'Formato de horário inválido (HH:MM)'),
          endTime: z
            .string()
            .optional()
            .refine(value => !value || timeRegex.test(value), 'Formato de horário inválido (HH:MM)'),
        }),
      )
      .min(1, 'Selecione pelo menos um dia da semana')
      .refine(
        weekDaySessions => {
          return weekDaySessions.every(session => {
            // Se ambos os horários estão definidos, valida se o horário fim é posterior ao início
            if (session.startTime && session.endTime) {
              const [startHour, startMinute] = session.startTime.split(':').map(Number)
              const [endHour, endMinute] = session.endTime.split(':').map(Number)

              const startTimeInMinutes = startHour * 60 + startMinute
              const endTimeInMinutes = endHour * 60 + endMinute

              return startTimeInMinutes < endTimeInMinutes
            }

            // Se apenas um horário está definido, não é válido
            if (session.startTime && !session.endTime) {
              return false
            }

            if (!session.startTime && session.endTime) {
              return false
            }

            // Ambos definidos ou ambos indefinidos é válido
            return true
          })
        },
        {
          message:
            'Se informar horários, ambos início e fim devem ser preenchidos e o fim deve ser posterior ao início',
        },
      ),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    endDate: z.string().min(1, 'Data fim é obrigatória'),
    dateOverrides: z.array(dateOverrideSchema).default([]),
  })
  .refine(
    data => {
      if (!data.startDate || !data.endDate) return true // Deixa a validação de campos obrigatórios para o schema principal

      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      // Verifica se as datas são válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return true

      return startDate < endDate
    },
    {
      message: 'Data fim deve ser posterior à data de início',
      path: ['endDate'],
    },
  )
  .superRefine((data, ctx) => {
    if (!data.dateOverrides.length) return

    const baseStart = new Date(data.startDate + 'T00:00:00')
    const baseEnd = new Date(data.endDate + 'T00:00:00')

    data.dateOverrides.forEach((override, index) => {
      const overrideStart = new Date(override.startDate + 'T00:00:00')
      const overrideEnd = new Date((override.endDate ?? override.startDate) + 'T00:00:00')

      if (Number.isNaN(overrideStart.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateOverrides', index, 'startDate'],
          message: 'Data inicial inválida',
        })
        return
      }

      if (Number.isNaN(overrideEnd.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateOverrides', index, 'endDate'],
          message: 'Data final inválida',
        })
        return
      }

      if (overrideStart < baseStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateOverrides', index, 'startDate'],
          message: 'A data inicial deve estar dentro do período selecionado',
        })
      }

      if (overrideEnd > baseEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateOverrides', index, override.endDate ? 'endDate' : 'startDate'],
          message: 'A data deve estar dentro do período selecionado',
        })
      }
    })
  })

export type SpreadsheetFormValues = z.infer<typeof spreadsheetFormSchema>
