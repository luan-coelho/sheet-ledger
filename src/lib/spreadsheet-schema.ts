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

// Type for weekday sessions configuration
export type WeekdaySession = {
  day: WeekDays
  sessions: number
  startTime?: string
  endTime?: string
}

// Nova estrutura para configuração de agendamento avançado
export type SessionTime = {
  startTime: string
  endTime: string
  sessionCount: number
}

export type ScheduleException = {
  date: string // formato: "YYYY-MM-DD"
  sessions: SessionTime[]
}

export type AdvancedScheduleConfig = {
  enabled: boolean
  exceptions?: ScheduleException[]
}

export const spreadsheetFormSchema = z
  .object({
    professionalId: z.string().uuid('Selecione um profissional'),
    licenseNumber: z.string().min(1, 'Nº conselho do profissional'),
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
            .refine(
              value => !value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
              'Formato de horário inválido (HH:MM)',
            ),
          endTime: z
            .string()
            .optional()
            .refine(
              value => !value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
              'Formato de horário inválido (HH:MM)',
            ),
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
    // Nova configuração avançada de agendamento (opcional)
    advancedSchedule: z
      .object({
        enabled: z.boolean(),
        exceptions: z
          .array(
            z.object({
              date: z.string(),
              sessions: z.array(
                z.object({
                  startTime: z.string(),
                  endTime: z.string(),
                  sessionCount: z.number().min(1, 'Mínimo 1 sessão').max(10, 'Máximo 10 sessões'),
                }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
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

export type SpreadsheetFormValues = z.infer<typeof spreadsheetFormSchema>
