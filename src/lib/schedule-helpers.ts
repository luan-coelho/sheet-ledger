import { WeekDays, type AdvancedScheduleConfig, type WeekdaySession } from '@/lib/spreadsheet-schema'

import type { ScheduleConfiguration, SessionTime, WeekdaySchedule } from '@/types/schedule'

/**
 * Converte WeekdaySession[] para WeekdaySchedule[]
 */
export function weekdaySessionsToSchedules(sessions: WeekdaySession[]): WeekdaySchedule[] {
  const allDays = [
    WeekDays.MONDAY,
    WeekDays.TUESDAY,
    WeekDays.WEDNESDAY,
    WeekDays.THURSDAY,
    WeekDays.FRIDAY,
    WeekDays.SATURDAY,
    WeekDays.SUNDAY,
  ]

  return allDays.map(day => {
    const session = sessions.find(s => s.day === day)

    if (!session) {
      return {
        day,
        enabled: false,
        sessions: [],
      }
    }

    const sessionTimes: SessionTime[] = []
    if (session.startTime && session.endTime) {
      sessionTimes.push({
        startTime: session.startTime,
        endTime: session.endTime,
        sessionCount: session.sessions,
      })
    }

    return {
      day,
      enabled: true,
      sessions: sessionTimes,
    }
  })
}

/**
 * Converte WeekdaySchedule[] para WeekdaySession[]
 */
export function weekdaySchedulesToSessions(schedules: WeekdaySchedule[]): WeekdaySession[] {
  return schedules
    .filter(s => s.enabled)
    .map(schedule => {
      const firstSession = schedule.sessions[0]
      const totalSessions = schedule.sessions.reduce((acc, current) => acc + (current.sessionCount || 0), 0)

      return {
        day: schedule.day,
        sessions: totalSessions || 1,
        startTime: firstSession?.startTime || undefined,
        endTime: firstSession?.endTime || undefined,
      }
    })
}

/**
 * Converte ScheduleConfiguration para estrutura do formulário
 */
export function scheduleConfigToFormData(config: ScheduleConfiguration): {
  weekDaySessions: WeekdaySession[]
  advancedSchedule: AdvancedScheduleConfig
} {
  return {
    weekDaySessions: weekdaySchedulesToSessions(config.weekdaySchedules),
    advancedSchedule: {
      enabled: true,
      exceptions: config.exceptions,
    },
  }
}

/**
 * Converte dados do formulário para ScheduleConfiguration
 */
export function formDataToScheduleConfig(
  weekDaySessions: WeekdaySession[],
  startDate: string,
  endDate: string,
  advancedSchedule?: AdvancedScheduleConfig,
): ScheduleConfiguration {
  return {
    startDate,
    endDate,
    weekdaySchedules: weekdaySessionsToSchedules(weekDaySessions),
    exceptions: advancedSchedule?.exceptions || [],
  }
}

/**
 * Verifica se o agendamento avançado está habilitado
 */
export function hasAdvancedSchedule(advancedSchedule?: AdvancedScheduleConfig): boolean {
  return advancedSchedule?.enabled === true
}

/**
 * Obtém resumo do agendamento avançado
 */
export function getAdvancedScheduleSummary(advancedSchedule?: AdvancedScheduleConfig): string {
  if (!advancedSchedule?.enabled) {
    return 'Não configurado'
  }

  const exceptionCount = advancedSchedule.exceptions?.length || 0
  if (exceptionCount === 0) {
    return 'Configurado (sem exceções)'
  }

  return `Configurado (${exceptionCount} ${exceptionCount === 1 ? 'exceção' : 'exceções'})`
}
