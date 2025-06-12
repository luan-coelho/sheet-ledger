import { WeekDays, meses, WeekdaySession } from './spreadsheet-schema'

export type SessionDate = {
  date: Date
  sessions: number
}

/**
 * Utility functions for generating preview data
 */
export class PreviewUtils {
  /**
   * Generates session dates for a specific month and year, filtered by selected days of week
   * @param year Year
   * @param month Month (0-11)
   * @param weekDays Array of selected weekdays
   * @returns Array of dates representing selected days
   */
  static generateSessionDates(
    year: number,
    month: number,
    weekDays: WeekDays[]
  ): Date[] {
    const selectedDays: Date[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    // Convert WeekDays enum to day indices (0 = Monday, 6 = Sunday)
    const daysOfWeekIndices = weekDays.map(day => this.getDayIndex(day))
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Convert JS day (0 = Sunday) to our day (0 = Monday)
      const jsDay = d.getDay() // 0 = Sunday, 1 = Monday, etc.
      const ourDay = jsDay === 0 ? 6 : jsDay - 1 // Convert to 0 = Monday, 6 = Sunday
      
      if (daysOfWeekIndices.includes(ourDay)) {
        selectedDays.push(new Date(d))
      }
    }
    
    return selectedDays
  }

  /**
   * Converts WeekDays enum to day index
   * @param day WeekDays enum value
   * @returns Day index (0 = Monday, 6 = Sunday)
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
   * Formats a date to DD/MM/YYYY format
   * @param date Date to format
   * @returns Formatted date string
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  /**
   * Formats weekdays range for display
   * @param weekDays Array of selected weekdays
   * @returns Formatted string like "SEG À SEX" or "SEG, QUA, SEX"
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

    // Sort weekdays by their index
    const sortedDays = [...weekDays].sort((a, b) => this.getDayIndex(a) - this.getDayIndex(b))
    
    // Check if it's a consecutive range from Monday to Friday
    const isWeekdayRange = sortedDays.length === 5 && 
      sortedDays.includes(WeekDays.MONDAY) &&
      sortedDays.includes(WeekDays.TUESDAY) &&
      sortedDays.includes(WeekDays.WEDNESDAY) &&
      sortedDays.includes(WeekDays.THURSDAY) &&
      sortedDays.includes(WeekDays.FRIDAY)

    if (isWeekdayRange) {
      return 'SEG À SEX'
    }

    // Otherwise, list all selected days
    return sortedDays.map(day => dayAbbreviations[day]).join(', ')
  }

  /**
   * Gets month name from month index
   * @param monthIndex Month index (0-11)
   * @returns Month name in Portuguese
   */
  static getMonthName(monthIndex: number): string {
    const month = meses.find(m => parseInt(m.value) === monthIndex)
    return month?.label || 'Janeiro'
  }

  /**
   * Formats competência (month/year) for display
   * @param monthIndex Month index (0-11)
   * @param year Year
   * @returns Formatted string like "MARÇO/2025"
   */
  static formatCompetencia(monthIndex: number, year: string): string {
    const monthName = this.getMonthName(monthIndex)
    return `${monthName.toUpperCase()}/${year}`
  }

  /**
   * Generates session dates with sessions per day for a specific month and year
   * @param year Year
   * @param month Month (0-11)
   * @param weekDaySessions Array of weekday sessions configuration
   * @returns Array of session dates with sessions count
   */
  static generateSessionDatesWithSessions(
    year: number,
    month: number,
    weekDaySessions: WeekdaySession[]
  ): SessionDate[] {
    const sessionDates: SessionDate[] = []
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Create a map for quick lookup of sessions by day
    const sessionsMap = new Map<WeekDays, number>()
    weekDaySessions.forEach(({ day, sessions }) => {
      sessionsMap.set(day, sessions)
    })

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Convert JS day (0 = Sunday) to our day enum
      const jsDay = d.getDay() // 0 = Sunday, 1 = Monday, etc.
      const ourDay = this.getWeekDayFromJSDay(jsDay)

      if (sessionsMap.has(ourDay)) {
        sessionDates.push({
          date: new Date(d),
          sessions: sessionsMap.get(ourDay)!
        })
      }
    }

    return sessionDates
  }

  /**
   * Converts JS day index to WeekDays enum
   * @param jsDay JS day index (0 = Sunday, 1 = Monday, etc.)
   * @returns WeekDays enum value
   */
  private static getWeekDayFromJSDay(jsDay: number): WeekDays {
    switch (jsDay) {
      case 1: return WeekDays.MONDAY
      case 2: return WeekDays.TUESDAY
      case 3: return WeekDays.WEDNESDAY
      case 4: return WeekDays.THURSDAY
      case 5: return WeekDays.FRIDAY
      case 6: return WeekDays.SATURDAY
      case 0: return WeekDays.SUNDAY
      default: return WeekDays.MONDAY
    }
  }

  /**
   * Formats weekdays range with sessions for display
   * @param weekDaySessions Array of weekday sessions configuration
   * @returns Formatted string like "SEG(4), TER(4), QUA(4)"
   */
  static formatWeekDaysRangeWithSessions(weekDaySessions: WeekdaySession[]): string {
    if (weekDaySessions.length === 0) return ''

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

    // Sort weekdays by their index
    const sortedSessions = [...weekDaySessions].sort((a, b) => this.getDayIndex(a.day) - this.getDayIndex(b.day))

    return sortedSessions.map(({ day, sessions }) =>
      `${dayAbbreviations[day]}(${sessions})`
    ).join(', ')
  }
}
