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
}

export const spreadsheetFormSchema = z
  .object({
    professionalId: z.string().uuid('Selecione um profissional válido'),
    licenseNumber: z.string().min(1, 'Nº conselho do profissional é obrigatório'),
    authorizedSession: z.string().min(1, 'Sessão autorizada é obrigatório'),
    patientId: z.string().uuid('Selecione um paciente válido'),
    guardianId: z.string().uuid('Selecione um responsável válido'),
    healthPlanId: z.string().uuid('Selecione um plano de saúde válido'),
    weekDaySessions: z
      .array(
        z.object({
          day: z.nativeEnum(WeekDays),
          sessions: z.number().min(1, 'Mínimo 1 sessão').max(10, 'Máximo 10 sessões'),
        }),
      )
      .min(1, 'Selecione pelo menos um dia da semana'),
    dataInicio: z.string().min(1, 'Data de início é obrigatória'),
    dataFim: z.string().min(1, 'Data fim é obrigatória'),
  })
  .refine(
    data => {
      if (!data.dataInicio || !data.dataFim) return true // Deixa a validação de campos obrigatórios para o schema principal

      const dataInicio = new Date(data.dataInicio)
      const dataFim = new Date(data.dataFim)

      // Verifica se as datas são válidas
      if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) return true

      return dataInicio < dataFim
    },
    {
      message: 'Data fim deve ser posterior à data de início',
      path: ['dataFim'],
    },
  )

export type SpreadsheetFormValues = z.infer<typeof spreadsheetFormSchema>
