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

export const spreadsheetFormSchema = z.object({
  professionalId: z.string().uuid('Selecione um profissional válido'),
  licenseNumber: z.string().min(1, 'Nº conselho do profissional é obrigatório'),
  authorizedSession: z.string().min(1, 'Sessão autorizada é obrigatório'),
  patientId: z.string().uuid('Selecione um paciente válido'),
  guardianId: z.string().uuid('Selecione um responsável válido'),
  healthPlanId: z.string().uuid('Selecione um plano de saúde válido'),
  weekDays: z.array(z.nativeEnum(WeekDays)).min(1, 'Selecione pelo menos um dia da semana'),
  competencia: z.object({
    mes: z.string(),
    ano: z.string().regex(/^\d{4}$/, 'Formato de ano inválido')
  }, {
    required_error: 'Selecione a competência'
  })
})

export type SpreadsheetFormValues = z.infer<typeof spreadsheetFormSchema>
