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
  startTime: string
  endTime: string
}

export const spreadsheetFormSchema = z
  .object({
    professionalId: z.string().uuid('Selecione um profissional válido'),
    licenseNumber: z.string().min(1, 'Nº conselho do profissional é obrigatório'),
    authorizedSession: z.string().optional(),
    patientId: z.string().uuid('Selecione um paciente válido'),
    guardianId: z.string().uuid('Selecione um responsável válido'),
    healthPlanId: z.string().uuid('Selecione um plano de saúde válido'),
    cardNumber: z.string().optional(),
    guideNumber: z.string().optional(),
    weekDaySessions: z
      .array(
        z.object({
          day: z.nativeEnum(WeekDays),
          sessions: z.number().min(1, 'Mínimo 1 sessão').max(10, 'Máximo 10 sessões'),
          startTime: z
            .string()
            .min(1, 'Horário de início é obrigatório')
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)'),
          endTime: z
            .string()
            .min(1, 'Horário fim é obrigatório')
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)'),
        }),
      )
      .min(1, 'Selecione pelo menos um dia da semana')
      .refine(
        weekDaySessions => {
          return weekDaySessions.every(session => {
            if (!session.startTime || !session.endTime) return true

            const [startHour, startMinute] = session.startTime.split(':').map(Number)
            const [endHour, endMinute] = session.endTime.split(':').map(Number)

            const startTimeInMinutes = startHour * 60 + startMinute
            const endTimeInMinutes = endHour * 60 + endMinute

            return startTimeInMinutes < endTimeInMinutes
          })
        },
        {
          message: 'Horário fim deve ser posterior ao horário de início para todos os dias',
        },
      ),
    startDate: z.string().min(1, 'Data de início é obrigatória'),
    endDate: z.string().min(1, 'Data fim é obrigatória'),
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
