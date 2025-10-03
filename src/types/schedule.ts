import { WeekDays } from '@/lib/spreadsheet-schema'

/**
 * Representa um horário de sessão (ex: 08:00 - 09:00)
 */
export type SessionTime = {
  startTime: string // formato: "HH:MM"
  endTime: string // formato: "HH:MM"
}

/**
 * Configuração padrão para um dia da semana
 */
export type WeekdaySchedule = {
  day: WeekDays
  enabled: boolean
  sessions: SessionTime[]
}

/**
 * Exceção para uma data específica
 * Sobrescreve a configuração padrão do dia da semana
 */
export type DateException = {
  date: string // formato: "YYYY-MM-DD"
  sessions: SessionTime[]
  // Se sessions for vazio, significa que não há atendimento neste dia
}

/**
 * Estrutura completa do agendamento
 */
export type ScheduleConfiguration = {
  startDate: string // formato: "YYYY-MM-DD"
  endDate: string // formato: "YYYY-MM-DD"
  weekdaySchedules: WeekdaySchedule[]
  exceptions: DateException[]
}
