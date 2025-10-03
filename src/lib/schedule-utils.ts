import { DateOverride, WeekDays, WeekdaySession } from './spreadsheet-schema'

export type SessionScheduleRecord = {
  date: Date
  sessions: number
  startTime?: string
  endTime?: string
  source: 'default' | 'override'
  overrideIndex?: number
}

function getWeekDayFromJSDay(jsDay: number): WeekDays {
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
    default:
      return WeekDays.SUNDAY
  }
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildWeekDaySessionMap(weekDaySessions: WeekdaySession[]): Map<WeekDays, WeekdaySession> {
  const map = new Map<WeekDays, WeekdaySession>()
  weekDaySessions.forEach(session => {
    map.set(session.day, session)
  })
  return map
}

function buildOverridesMap(
  overrides: DateOverride[],
  weekDaySessionMap: Map<WeekDays, WeekdaySession>,
): Map<string, SessionScheduleRecord[]> {
  const map = new Map<string, SessionScheduleRecord[]>()

  overrides.forEach((override, overrideIndex) => {
    const startDate = new Date(override.startDate + 'T00:00:00')
    const endDate = new Date((override.endDate ?? override.startDate) + 'T00:00:00')

    const current = new Date(startDate)
    while (current <= endDate) {
      const key = formatDateKey(current)
      const weekDay = getWeekDayFromJSDay(current.getDay())
      const defaultSessions = weekDaySessionMap.get(weekDay)?.sessions
      const sessions = override.sessions ?? defaultSessions ?? 1

      const entry: SessionScheduleRecord = {
        date: new Date(current),
        sessions,
        startTime: override.startTime,
        endTime: override.endTime,
        source: 'override',
        overrideIndex,
      }

      const existing = map.get(key) ?? []
      existing.push(entry)
      map.set(key, existing)

      current.setDate(current.getDate() + 1)
    }
  })

  // Ordena os horários específicos de cada dia pelo horário inicial
  map.forEach(entries => {
    entries.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime)
      }
      if (a.startTime) return -1
      if (b.startTime) return 1
      return 0
    })
  })

  return map
}

export function generateSessionSchedule(
  startDate: Date,
  endDate: Date,
  options: {
    weekDaySessions: WeekdaySession[]
    dateOverrides?: DateOverride[]
  },
): SessionScheduleRecord[] {
  const records: SessionScheduleRecord[] = []

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return records
  }

  const weekDaySessionMap = buildWeekDaySessionMap(options.weekDaySessions)
  const overridesMap = buildOverridesMap(options.dateOverrides ?? [], weekDaySessionMap)

  const current = new Date(startDate)

  while (current <= endDate) {
    const key = formatDateKey(current)
    const overridesForDay = overridesMap.get(key)

    if (overridesForDay && overridesForDay.length > 0) {
      overridesForDay.forEach(entry => {
        records.push({
          date: new Date(entry.date),
          sessions: entry.sessions,
          startTime: entry.startTime,
          endTime: entry.endTime,
          source: 'override',
          overrideIndex: entry.overrideIndex,
        })
      })
    } else {
      const weekDay = getWeekDayFromJSDay(current.getDay())
      const defaultSession = weekDaySessionMap.get(weekDay)

      if (defaultSession) {
        records.push({
          date: new Date(current),
          sessions: defaultSession.sessions,
          startTime: defaultSession.startTime,
          endTime: defaultSession.endTime,
          source: 'default',
        })
      }
    }

    current.setDate(current.getDate() + 1)
  }

  return records
}

export function groupSessionScheduleByDate(records: SessionScheduleRecord[]): Map<string, SessionScheduleRecord[]> {
  const grouped = new Map<string, SessionScheduleRecord[]>()

  records.forEach(record => {
    const key = formatDateKey(record.date)
    const existing = grouped.get(key) ?? []
    existing.push(record)
    grouped.set(key, existing)
  })

  return grouped
}
