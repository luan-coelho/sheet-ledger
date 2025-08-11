import { meses, WeekDays, WeekdaySession } from './spreadsheet-schema'

export type SessionDate = {
  date: Date
  sessions: number
  startTime?: string
  endTime?: string
}

/**
 * Funções utilitárias para gerar dados de preview
 */
export class PreviewUtils {
  /**
   * Gera datas de sessões para um mês específico e ano, considerando os dias da semana selecionados
   * @param year Ano
   * @param month Mês (0-11)
   * @param weekDays Array de dias da semana selecionados
   * @returns Array de datas representando os dias selecionados
   */
  static generateSessionDates(year: number, month: number, weekDays: WeekDays[]): Date[] {
    const selectedDays: Date[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Converte o enum WeekDays para o índice do dia da semana
    const daysOfWeekIndices = weekDays.map(day => this.getDayIndex(day))

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Converte o dia da semana JS para o enum WeekDays
      const jsDay = d.getDay() // 0 = Domingo, 1 = Segunda, etc.
      const ourDay = jsDay === 0 ? 6 : jsDay - 1 // Converte para 0 = Segunda, 6 = Domingo

      if (daysOfWeekIndices.includes(ourDay)) {
        selectedDays.push(new Date(d))
      }
    }

    return selectedDays
  }

  /**
   * Converte o enum WeekDays para o índice do dia da semana
   * @param day Valor do enum WeekDays
   * @returns Índice do dia da semana (0 = Segunda, 6 = Domingo)
   */
  private static getDayIndex(day: WeekDays): number {
    switch (day) {
      case WeekDays.MONDAY:
        return 0
      case WeekDays.TUESDAY:
        return 1
      case WeekDays.WEDNESDAY:
        return 2
      case WeekDays.THURSDAY:
        return 3
      case WeekDays.FRIDAY:
        return 4
      case WeekDays.SATURDAY:
        return 5
      case WeekDays.SUNDAY:
        return 6
      default:
        return 0
    }
  }

  /**
   * Formata uma data para o formato DD/MM/YYYY, exemplo: "01/01/2025"
   * @param date Data a ser formatada
   * @returns String formatada como "01/01/2025"
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  /**
   * Formata o range de dias da semana para exibição, exemplo: "SEG À SEX" ou "SEG, QUA, SEX"
   * @param weekDays Array de dias da semana selecionados
   * @returns String formatada como "SEG À SEX" ou "SEG, QUA, SEX"
   */
  static formatWeekDaysRange(weekDays: WeekDays[]): string {
    if (weekDays.length === 0) return ''

    // Map weekdays to abbreviations
    const dayAbbreviations: Record<WeekDays, string> = {
      [WeekDays.MONDAY]: 'SEG',
      [WeekDays.TUESDAY]: 'TER',
      [WeekDays.WEDNESDAY]: 'QUA',
      [WeekDays.THURSDAY]: 'QUI',
      [WeekDays.FRIDAY]: 'SEX',
      [WeekDays.SATURDAY]: 'SAB',
      [WeekDays.SUNDAY]: 'DOM',
    }

    // Ordena os dias da semana pelo índice
    const sortedDays = [...weekDays].sort((a, b) => this.getDayIndex(a) - this.getDayIndex(b))

    // Verifica se é um range consecutivo de segunda a sexta-feira
    const isWeekdayRange =
      sortedDays.length === 5 &&
      sortedDays.includes(WeekDays.MONDAY) &&
      sortedDays.includes(WeekDays.TUESDAY) &&
      sortedDays.includes(WeekDays.WEDNESDAY) &&
      sortedDays.includes(WeekDays.THURSDAY) &&
      sortedDays.includes(WeekDays.FRIDAY)

    if (isWeekdayRange) {
      return 'SEG À SEX'
    }

    // Caso contrário, lista todos os dias selecionados
    return sortedDays.map(day => dayAbbreviations[day]).join(', ')
  }

  /**
   * Obtém o nome do mês a partir do índice do mês
   * @param monthIndex Índice do mês (0-11)
   * @returns Nome do mês em português
   */
  static getMonthName(monthIndex: number): string {
    const month = meses.find(m => parseInt(m.value) === monthIndex)
    return month?.label || 'Janeiro'
  }

  /**
   * Formata a competência (mês/ano) para exibição, exemplo: "MARÇO/2025"
   * @param monthIndex Índice do mês (0-11)
   * @param year Ano
   * @returns String formatada como "MARÇO/2025"
   */
  static formatCompetencia(monthIndex: number, year: string): string {
    const monthName = this.getMonthName(monthIndex)
    return `${monthName.toUpperCase()}/${year}`
  }

  /**
   * Gera datas de sessões para um mês específico, considerando as sessões por dia da semana, exemplo:
   * year: 2025, month: 0, weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4 }, { day: WeekDays.WEDNESDAY, sessions: 4 }]
   * retorna: [{ date: 2025-01-01, sessions: 4 }, { date: 2025-01-03, sessions: 4 }, { date: 2025-01-06, sessions: 4 }, ...]
   * @param year Ano
   * @param month Mês (0-11)
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns Array de datas de sessões com o número de sessões por dia
   */
  static generateSessionDatesWithSessions(
    year: number,
    month: number,
    weekDaySessions: WeekdaySession[],
  ): SessionDate[] {
    const sessionDates: SessionDate[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Cria um mapa para busca rápida de sessões por dia
    const sessionsMap = new Map<WeekDays, { sessions: number; startTime: string; endTime: string }>()
    weekDaySessions.forEach(({ day, sessions, startTime, endTime }) => {
      sessionsMap.set(day, { sessions, startTime, endTime })
    })

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Converte o dia da semana JS para o enum WeekDays
      const jsDay = d.getDay() // 0 = Domingo, 1 = Segunda, etc.
      const ourDay = this.getWeekDayFromJSDay(jsDay)

      if (sessionsMap.has(ourDay)) {
        const sessionData = sessionsMap.get(ourDay)!
        sessionDates.push({
          date: new Date(d),
          sessions: sessionData.sessions,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
        })
      }
    }

    return sessionDates
  }

  /**
   * Converte o índice do dia da semana JS para o enum WeekDays
   * @param jsDay Índice do dia da semana JS (0 = Domingo, 1 = Segunda, etc.)
   * @returns Valor do enum WeekDays
   */
  private static getWeekDayFromJSDay(jsDay: number): WeekDays {
    switch (jsDay) {
      case 1:
        return WeekDays.MONDAY
      case 2:
        return WeekDays.TUESDAY
      case 3:
        return WeekDays.WEDNESDAY
      case 4:
        return WeekDays.THURSDAY
      case 5:
        return WeekDays.FRIDAY
      case 6:
        return WeekDays.SATURDAY
      case 0:
        return WeekDays.SUNDAY
      default:
        return WeekDays.MONDAY
    }
  }

  /**
   * Gera datas de sessões para um período específico, considerando os dias da semana selecionados, exemplo:
   * startDate: 2025-01-01, endDate: 2025-01-31, weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4 }, { day: WeekDays.WEDNESDAY, sessions: 4 }]
   * retorna: [{ date: 2025-01-01, sessions: 4 }, { date: 2025-01-02, sessions: 0 }, { date: 2025-01-03, sessions: 4 }, ...]
   * @param startDate Data de início do período
   * @param endDate Data de fim do período
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns Array de datas de sessões com o número de sessões por dia
   */
  static generateSessionDatesWithSessionsForPeriod(
    startDate: Date,
    endDate: Date,
    weekDaySessions: WeekdaySession[],
  ): SessionDate[] {
    const sessionDates: SessionDate[] = []

    // Cria um mapa para busca rápida de sessões por dia
    const sessionsMap = new Map<WeekDays, { sessions: number; startTime: string; endTime: string }>()
    weekDaySessions.forEach(({ day, sessions, startTime, endTime }) => {
      sessionsMap.set(day, { sessions, startTime, endTime })
    })

    // Itera através de cada dia no período
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const jsDay = currentDate.getDay()
      const weekDay = this.getWeekDayFromJSDay(jsDay)

      // Verifica se este dia da semana está selecionado
      if (sessionsMap.has(weekDay)) {
        const sessionData = sessionsMap.get(weekDay)!
        sessionDates.push({
          date: new Date(currentDate),
          sessions: sessionData.sessions,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
        })
      }

      // Move para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return sessionDates
  }

  /**
   * Formata o range de dias da semana com as sessões para exibição, exemplo: "SEG(4), TER(4), QUA(4)"
   * @param weekDaySessions Array de configuração de sessões por dia da semana
   * @returns String formatada como "SEG(4), TER(4), QUA(4)"
   */
  static formatWeekDaysRangeWithSessions(weekDaySessions: WeekdaySession[]): string {
    if (weekDaySessions.length === 0) return ''

    // Mapeia os dias da semana para abreviações
    const dayAbbreviations: Record<WeekDays, string> = {
      [WeekDays.MONDAY]: 'SEG',
      [WeekDays.TUESDAY]: 'TER',
      [WeekDays.WEDNESDAY]: 'QUA',
      [WeekDays.THURSDAY]: 'QUI',
      [WeekDays.FRIDAY]: 'SEX',
      [WeekDays.SATURDAY]: 'SAB',
      [WeekDays.SUNDAY]: 'DOM',
    }

    // Ordena os dias da semana pelo índice
    const sortedSessions = [...weekDaySessions].sort((a, b) => this.getDayIndex(a.day) - this.getDayIndex(b.day))

    return sortedSessions
      .map(({ day, sessions, startTime, endTime }) => {
        const hasTimeInfo = startTime && endTime
        const timeRange = hasTimeInfo ? ` ${startTime}-${endTime}` : ''
        return `${dayAbbreviations[day]}(${sessions})${timeRange}`
      })
      .join(', ')
  }
}
