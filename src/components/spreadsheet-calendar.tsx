'use client'

import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  WeekDays,
  type AdvancedScheduleConfig,
  type SessionTime,
  type SpreadsheetFormValues,
  type WeekdaySession,
} from '@/lib/spreadsheet-schema'
import { cn } from '@/lib/utils'

const weekDayHeaderItems = [
  { key: WeekDays.SUNDAY, label: 'Dom', fullName: WeekDays.SUNDAY, number: 0 },
  { key: WeekDays.MONDAY, label: 'Seg', fullName: WeekDays.MONDAY, number: 1 },
  { key: WeekDays.TUESDAY, label: 'Ter', fullName: WeekDays.TUESDAY, number: 2 },
  { key: WeekDays.WEDNESDAY, label: 'Qua', fullName: WeekDays.WEDNESDAY, number: 3 },
  { key: WeekDays.THURSDAY, label: 'Qui', fullName: WeekDays.THURSDAY, number: 4 },
  { key: WeekDays.FRIDAY, label: 'Sex', fullName: WeekDays.FRIDAY, number: 5 },
  { key: WeekDays.SATURDAY, label: 'Sáb', fullName: WeekDays.SATURDAY, number: 6 },
]

const weekDayToNumber: Record<WeekDays, number> = {
  [WeekDays.SUNDAY]: 0,
  [WeekDays.MONDAY]: 1,
  [WeekDays.TUESDAY]: 2,
  [WeekDays.WEDNESDAY]: 3,
  [WeekDays.THURSDAY]: 4,
  [WeekDays.FRIDAY]: 5,
  [WeekDays.SATURDAY]: 6,
}

const weekDayOrder = [
  WeekDays.MONDAY,
  WeekDays.TUESDAY,
  WeekDays.WEDNESDAY,
  WeekDays.THURSDAY,
  WeekDays.FRIDAY,
  WeekDays.SATURDAY,
  WeekDays.SUNDAY,
]

const DATE_KEY_FORMAT = 'yyyy-MM-dd'

function sortWeekDaySessions(sessions: WeekdaySession[]): WeekdaySession[] {
  return [...sessions].sort((a, b) => weekDayOrder.indexOf(a.day) - weekDayOrder.indexOf(b.day))
}

function clampSessions(value: number): number {
  return Math.max(1, Math.min(10, value))
}

function formatTimeInput(value: string): string {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 0) return ''
  if (numbers.length <= 2) return numbers
  return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
}

function cloneSessions(sessions: SessionTime[]): SessionTime[] {
  return sessions.map(session => ({ ...session }))
}

function sessionsAreEqual(a: SessionTime[], b: SessionTime[]): boolean {
  if (a.length !== b.length) return false

  return a.every((session, index) => {
    const other = b[index]
    return (
      other !== undefined &&
      session.startTime === other.startTime &&
      session.endTime === other.endTime &&
      session.sessionCount === other.sessionCount
    )
  })
}

type SimpleCalendarProps = {
  startDate?: string
  endDate?: string
  weekDaySessions: WeekdaySession[]
  dailySessions: Map<string, SessionTime[]>
  exceptionDateSet: Set<string>
  onToggleWeekDay?: (day: WeekDays) => void
  onSelectDate?: (date: Date) => void
}

type SpreadsheetCalendarProps = {
  formData: SpreadsheetFormValues
  onClose?: () => void
  onWeekDaySessionsChange?: (sessions: WeekdaySession[]) => void
  onAdvancedScheduleChange?: (config: AdvancedScheduleConfig) => void
}

// Componente de calendário simplificado
function SimpleCalendar({
  startDate,
  endDate,
  weekDaySessions,
  dailySessions,
  exceptionDateSet,
  onToggleWeekDay,
  onSelectDate,
}: SimpleCalendarProps) {
  const startDateObj = useMemo(() => {
    if (startDate) {
      return new Date(startDate + 'T00:00:00')
    }
    return new Date()
  }, [startDate])

  const endDateObj = useMemo(() => {
    if (endDate) {
      return new Date(endDate + 'T00:00:00')
    }
    return new Date()
  }, [endDate])

  const isMultipleMonths = useMemo(() => {
    return startDateObj.getMonth() !== endDateObj.getMonth() || startDateObj.getFullYear() !== endDateObj.getFullYear()
  }, [startDateObj, endDateObj])

  const monthsInPeriod = useMemo(() => {
    if (!isMultipleMonths) {
      return [startDateObj]
    }

    return eachMonthOfInterval({ start: startOfMonth(startDateObj), end: startOfMonth(endDateObj) })
  }, [startDateObj, endDateObj, isMultipleMonths])

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  const currentViewDate = monthsInPeriod[currentMonthIndex] || startDateObj

  const monthStart = startOfMonth(currentViewDate)
  const monthEnd = endOfMonth(currentViewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDaySessionMap = useMemo(() => {
    const map = new Map<number, WeekdaySession>()
    weekDaySessions.forEach(session => {
      map.set(weekDayToNumber[session.day], session)
    })
    return map
  }, [weekDaySessions])

  const getDateKey = useCallback((date: Date) => format(date, DATE_KEY_FORMAT), [])

  const getSessionsForDay = useCallback(
    (date: Date) => {
      const key = getDateKey(date)
      return dailySessions.get(key) ?? []
    },
    [dailySessions, getDateKey],
  )

  const canNavigatePrevious = currentMonthIndex > 0
  const canNavigateNext = currentMonthIndex < monthsInPeriod.length - 1

  const navigatePrevious = () => {
    if (canNavigatePrevious) {
      setCurrentMonthIndex(prev => prev - 1)
    }
  }

  const navigateNext = () => {
    if (canNavigateNext) {
      setCurrentMonthIndex(prev => prev + 1)
    }
  }

  return (
    <div className="bg-background rounded-lg border shadow-sm">
      {/* Header do calendário */}
      <div className="bg-muted/30 relative flex min-h-[3.25rem] items-center justify-center border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {isMultipleMonths && (
            <Button
              variant="ghost"
              size="icon"
              onClick={navigatePrevious}
              disabled={!canNavigatePrevious}
              className="h-8 w-8 cursor-pointer disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h3 className="mx-2 text-base font-semibold tracking-tight select-none">
            {format(currentViewDate, 'MMMM yyyy', { locale: ptBR }).replace(/^[\wÀ-ÿ]/, c => c.toUpperCase())}
          </h3>
          {isMultipleMonths && (
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateNext}
              disabled={!canNavigateNext}
              className="h-8 w-8 cursor-pointer disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isMultipleMonths && (
          <div className="text-muted-foreground absolute right-4 text-xs font-medium">
            {currentMonthIndex + 1} / {monthsInPeriod.length}
          </div>
        )}
      </div>

      {/* Dias da semana */}
      <div className="bg-muted/20 grid grid-cols-7 border-b">
        {weekDayHeaderItems.map(item => {
          const isSelected = weekDaySessions.some(session => session.day === item.key)
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleWeekDay?.(item.key)}
              disabled={!onToggleWeekDay}
              className={cn(
                'relative border-r py-3 text-center text-xs font-semibold tracking-wide uppercase transition-all duration-200 last:border-r-0',
                isSelected
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                onToggleWeekDay
                  ? 'focus-visible:ring-primary/40 cursor-pointer focus-visible:ring-2 focus-visible:outline-none'
                  : 'cursor-default opacity-70',
              )}
              title={item.fullName}
              aria-pressed={isSelected}
              aria-label={item.fullName}>
              {item.label}
              {isSelected && <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5" />}
            </button>
          )
        })}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = getDateKey(day)
          const isCurrentMonth = isSameMonth(day, currentViewDate)
          const sessionsForDay = getSessionsForDay(day)
          const totalSessions = sessionsForDay.reduce((total, session) => total + (session.sessionCount || 0), 0)
          const hasException = exceptionDateSet.has(dateKey)

          const weekDaySession = weekDaySessionMap.get(day.getDay())
          const isWeekDaySelected = Boolean(weekDaySession)
          const isAttendance = totalSessions > 0
          const isEditable = Boolean(onSelectDate) && (isWeekDaySelected || hasException)

          const handleDateClick = () => {
            if (isEditable && onSelectDate) {
              onSelectDate(new Date(day))
            }
          }

          const displayIntervals = sessionsForDay.slice(0, 2)
          const extraIntervalsCount = Math.max(0, sessionsForDay.length - displayIntervals.length)

          return (
            <button
              key={`${day.toISOString()}-${index}`}
              type="button"
              onClick={handleDateClick}
              disabled={!isEditable}
              className={cn(
                'group relative min-h-24 border-r border-b p-2 text-left transition-all duration-200 last:border-r-0 disabled:cursor-default',
                !isCurrentMonth && 'border-0 bg-zinc-100 text-zinc-400 dark:bg-zinc-900/60 dark:text-zinc-600',
                isAttendance && isCurrentMonth
                  ? 'bg-primary/10 border-primary/40 hover:bg-primary/15'
                  : hasException && isCurrentMonth
                    ? 'border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/10'
                    : isWeekDaySelected && isCurrentMonth
                      ? 'bg-primary/5 hover:bg-primary/10'
                      : isCurrentMonth
                        ? 'bg-background hover:bg-muted/30'
                        : '',
                isEditable &&
                  'focus-visible:ring-primary/40 cursor-pointer focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none',
              )}>
              <div className="flex h-full min-h-[5rem] flex-col items-center justify-center text-center">
                <div className="mb-2 flex items-center justify-center">
                  <span className="text-2xl leading-none font-bold">{format(day, 'd')}</span>
                  {hasException && (
                    <span className="bg-primary/10 text-primary absolute top-1 right-1 rounded-sm px-1.5 py-0.5 text-[9px] leading-none font-bold uppercase">
                      Exceção
                    </span>
                  )}
                </div>

                {isAttendance ? (
                  <div className="flex flex-1 flex-col items-center gap-1.5 text-xs">
                    <div className="bg-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <span className="leading-none">{totalSessions}</span>
                      <span className="leading-none opacity-90">{totalSessions > 1 ? 'sessões' : 'sessão'}</span>
                    </div>

                    <div className="w-full space-y-1">
                      {displayIntervals.map((interval, intervalIndex) => (
                        <div
                          key={`${dateKey}-${intervalIndex}`}
                          className="bg-background/60 flex items-center justify-center gap-1.5 rounded-sm px-1.5 py-1 text-[10px] leading-none font-medium">
                          <span className="text-foreground">{interval.startTime}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-foreground">{interval.endTime}</span>
                          <span className="text-muted-foreground">({interval.sessionCount})</span>
                        </div>
                      ))}
                    </div>

                    {extraIntervalsCount > 0 && (
                      <span className="text-muted-foreground text-[10px] leading-none font-medium">
                        +{extraIntervalsCount} mais
                      </span>
                    )}
                  </div>
                ) : hasException ? (
                  <div className="text-muted-foreground flex flex-1 items-center justify-center text-center text-[10px] leading-tight font-medium">
                    Sem atendimento
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      {/* Indicador de múltiplos meses e legenda */}
      <div className="bg-muted/20 p-4">
        {isMultipleMonths && (
          <p className="text-muted-foreground text-center text-xs">
            Período com {monthsInPeriod.length} {monthsInPeriod.length > 1 ? 'meses' : 'mês'}. Use as setas para
            navegar.
          </p>
        )}
      </div>
    </div>
  )
}

export function SpreadsheetCalendar({
  formData,
  onWeekDaySessionsChange,
  onAdvancedScheduleChange,
}: SpreadsheetCalendarProps) {
  const weekDaySessions = useMemo(() => sortWeekDaySessions(formData.weekDaySessions || []), [formData.weekDaySessions])

  const advancedSchedule = useMemo<AdvancedScheduleConfig>(() => {
    if (formData.advancedSchedule) {
      return formData.advancedSchedule
    }

    return {
      enabled: true,
      exceptions: [],
    }
  }, [formData.advancedSchedule])

  const emptyExceptions = useMemo<NonNullable<AdvancedScheduleConfig['exceptions']>>(() => [], [])
  const exceptions = advancedSchedule.exceptions ?? emptyExceptions

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [editingSessions, setEditingSessions] = useState<SessionTime[]>([])
  const [defaultSessionsPreview, setDefaultSessionsPreview] = useState<SessionTime[]>([])
  const [hasExistingException, setHasExistingException] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedDate(null)
    setSelectedDateKey(null)
    setEditingSessions([])
    setDefaultSessionsPreview([])
    setHasExistingException(false)
  }, [])

  const handleSelectDate = useCallback(
    (date: Date) => {
      const dateKey = format(date, DATE_KEY_FORMAT)
      const existingException = exceptions.find(exception => exception.date === dateKey) ?? null
      const weekDaySession = weekDaySessions.find(session => weekDayToNumber[session.day] === date.getDay()) ?? null

      const defaultSessions = weekDaySession
        ? [
            {
              startTime: weekDaySession.startTime ?? '',
              endTime: weekDaySession.endTime ?? '',
              sessionCount: weekDaySession.sessions,
            },
          ]
        : []

      setDefaultSessionsPreview(cloneSessions(defaultSessions))

      if (existingException) {
        setEditingSessions(cloneSessions(existingException.sessions))
        setHasExistingException(true)
      } else {
        setEditingSessions(cloneSessions(defaultSessions))
        setHasExistingException(false)
      }

      setSelectedDate(date)
      setSelectedDateKey(dateKey)
      setIsDialogOpen(true)
    },
    [exceptions, weekDaySessions],
  )

  const handleAddInterval = useCallback(() => {
    setEditingSessions(prev => [...prev, { startTime: '', endTime: '', sessionCount: 1 }])
  }, [])

  const handleSessionTimeChange = useCallback((index: number, field: 'startTime' | 'endTime', value: string) => {
    const formatted = formatTimeInput(value)
    setEditingSessions(prev =>
      prev.map((session, sessionIndex) => (sessionIndex === index ? { ...session, [field]: formatted } : session)),
    )
  }, [])

  const handleSessionCountChange = useCallback((index: number, value: number) => {
    setEditingSessions(prev =>
      prev.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, sessionCount: clampSessions(value) } : session,
      ),
    )
  }, [])

  const handleRemoveInterval = useCallback((index: number) => {
    setEditingSessions(prev => prev.filter((_, sessionIndex) => sessionIndex !== index))
  }, [])

  const handleMarkNoAttendance = useCallback(() => {
    setEditingSessions([])
  }, [])

  const handleRestoreDefault = useCallback(() => {
    setEditingSessions(cloneSessions(defaultSessionsPreview))
  }, [defaultSessionsPreview])

  const handleRemoveException = useCallback(() => {
    if (!selectedDateKey || !onAdvancedScheduleChange) {
      closeDialog()
      return
    }

    const filteredExceptions = exceptions.filter(exception => exception.date !== selectedDateKey)

    onAdvancedScheduleChange({
      ...advancedSchedule,
      exceptions: filteredExceptions,
    })

    toast.success('Exceção removida para o dia selecionado.')
    closeDialog()
  }, [advancedSchedule, closeDialog, exceptions, onAdvancedScheduleChange, selectedDateKey])

  const handleSaveException = useCallback(() => {
    if (!selectedDateKey) {
      closeDialog()
      return
    }

    if (!onAdvancedScheduleChange) {
      toast.error('Não foi possível atualizar a exceção. Atualize a página e tente novamente.')
      closeDialog()
      return
    }

    for (const session of editingSessions) {
      const hasStart = session.startTime.trim().length > 0
      const hasEnd = session.endTime.trim().length > 0

      if (hasStart !== hasEnd) {
        toast.error('Informe horário de início e fim para cada intervalo.')
        return
      }

      if (hasStart && hasEnd) {
        const [startHour, startMinute] = session.startTime.split(':').map(Number)
        const [endHour, endMinute] = session.endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMinute
        const endMinutes = endHour * 60 + endMinute

        if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || startMinutes >= endMinutes) {
          toast.error('Horário final deve ser posterior ao horário inicial.')
          return
        }
      }
    }

    const sanitizedSessions = editingSessions.map(session => ({
      startTime: session.startTime,
      endTime: session.endTime,
      sessionCount: clampSessions(session.sessionCount),
    }))

    const isSameAsDefault = sessionsAreEqual(sanitizedSessions, defaultSessionsPreview)

    const filteredExceptions = exceptions.filter(exception => exception.date !== selectedDateKey)

    if (isSameAsDefault) {
      if (hasExistingException) {
        onAdvancedScheduleChange({
          ...advancedSchedule,
          exceptions: filteredExceptions,
        })
        toast.success('Exceção removida. Dia voltou ao padrão semanal.')
      }
      closeDialog()
      return
    }

    filteredExceptions.push({ date: selectedDateKey, sessions: sanitizedSessions })
    const sortedExceptions = [...filteredExceptions].sort((a, b) => a.date.localeCompare(b.date))

    onAdvancedScheduleChange({
      ...advancedSchedule,
      exceptions: sortedExceptions,
    })

    toast.success('Exceção salva com sucesso.')
    closeDialog()
  }, [
    advancedSchedule,
    closeDialog,
    defaultSessionsPreview,
    editingSessions,
    exceptions,
    hasExistingException,
    onAdvancedScheduleChange,
    selectedDateKey,
  ])

  const dailySessions = useMemo(() => {
    const sessionsMap = new Map<string, SessionTime[]>()

    if (!formData.startDate || !formData.endDate) {
      return sessionsMap
    }

    const start = new Date(formData.startDate + 'T00:00:00')
    const end = new Date(formData.endDate + 'T00:00:00')

    const allDates = eachDayOfInterval({ start, end })

    const weeklySessionsByNumber = new Map<number, WeekdaySession>()
    weekDaySessions.forEach(session => {
      weeklySessionsByNumber.set(weekDayToNumber[session.day], session)
    })

    allDates.forEach(date => {
      const weekDaySession = weeklySessionsByNumber.get(date.getDay())
      if (!weekDaySession) return

      const dateKey = format(date, 'yyyy-MM-dd')

      sessionsMap.set(dateKey, [
        {
          startTime: weekDaySession.startTime ?? '',
          endTime: weekDaySession.endTime ?? '',
          sessionCount: weekDaySession.sessions,
        },
      ])
    })

    exceptions.forEach(exception => {
      sessionsMap.set(exception.date, exception.sessions)
    })

    return sessionsMap
  }, [formData.startDate, formData.endDate, exceptions, weekDaySessions])

  const exceptionDateSet = useMemo(() => {
    const set = new Set<string>()
    exceptions.forEach(exception => {
      set.add(exception.date)
    })
    return set
  }, [exceptions])

  const handleToggleWeekDay = (day: WeekDays) => {
    if (!onWeekDaySessionsChange) return

    const exists = weekDaySessions.some(session => session.day === day)
    const updated = exists
      ? weekDaySessions.filter(session => session.day !== day)
      : [...weekDaySessions, { day, sessions: 4 }]

    onWeekDaySessionsChange(sortWeekDaySessions(updated))
  }

  const handleSessionsChange = (day: WeekDays, sessions: number) => {
    if (!onWeekDaySessionsChange) return

    const updated = weekDaySessions.map(session =>
      session.day === day ? { ...session, sessions: clampSessions(sessions) } : session,
    )

    onWeekDaySessionsChange(sortWeekDaySessions(updated))
  }

  const handleStartTimeChange = (day: WeekDays, startTime: string) => {
    if (!onWeekDaySessionsChange) return

    const updated = weekDaySessions.map(session => (session.day === day ? { ...session, startTime } : session))

    onWeekDaySessionsChange(sortWeekDaySessions(updated))
  }

  const handleEndTimeChange = (day: WeekDays, endTime: string) => {
    if (!onWeekDaySessionsChange) return

    const updated = weekDaySessions.map(session => (session.day === day ? { ...session, endTime } : session))

    onWeekDaySessionsChange(sortWeekDaySessions(updated))
  }

  const handleTimeInputChange = (day: WeekDays, value: string, type: 'start' | 'end') => {
    const formatted = formatTimeInput(value)

    if (formatted.length === 5) {
      const [hours, minutes] = formatted.split(':').map(Number)
      if (hours > 23 || minutes > 59) return
    }

    if (type === 'start') {
      handleStartTimeChange(day, formatted)
    } else {
      handleEndTimeChange(day, formatted)
    }
  }

  // Calcular as datas de atendimento baseadas no formulário
  const attendanceDates = useMemo(() => {
    return Array.from(dailySessions.entries())
      .filter(([, sessions]) => sessions.length > 0 && sessions.some(item => (item.sessionCount ?? 0) > 0))
      .map(([dateKey]) => new Date(dateKey + 'T00:00:00'))
  }, [dailySessions])

  const totalSessions = useMemo(() => {
    let total = 0
    dailySessions.forEach(sessions => {
      total += sessions.reduce((sum, current) => sum + (current.sessionCount ?? 0), 0)
    })
    return total
  }, [dailySessions])

  const totalSessionsForSelectedDate = useMemo(
    () => editingSessions.reduce((sum, session) => sum + (session.sessionCount ?? 0), 0),
    [editingSessions],
  )

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return ''
    return format(selectedDate, "dd 'de' MMMM (EEEE)", { locale: ptBR })
  }, [selectedDate])

  const canRestoreDefault = defaultSessionsPreview.length > 0

  return (
    <Card className="mt-3">
      <CardHeader className="flex flex-row items-center justify-center">
        <CardTitle className="text-center">Calendário de Atendimentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">{attendanceDates.length}</div>
            <div className="text-muted-foreground text-sm">Dias de atendimento</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">{totalSessions}</div>
            <div className="text-muted-foreground text-sm">Total de sessões</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-primary text-2xl font-bold">
              {formData.startDate && formData.endDate
                ? `${format(new Date(formData.startDate + 'T00:00:00'), 'dd/MM', { locale: ptBR })} - ${format(
                    new Date(formData.endDate + 'T00:00:00'),
                    'dd/MM',
                    { locale: ptBR },
                  )}`
                : 'Selecione o período'}
            </div>
            <div className="text-muted-foreground text-sm">Período</div>
          </div>
        </div>

        {!formData.startDate || !formData.endDate ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
            Selecione as datas de início e fim para visualizar os dias gerados automaticamente.
          </div>
        ) : null}

        {/* Calendário visual simplificado */}
        <SimpleCalendar
          startDate={formData.startDate}
          endDate={formData.endDate}
          weekDaySessions={weekDaySessions}
          dailySessions={dailySessions}
          exceptionDateSet={exceptionDateSet}
          onToggleWeekDay={onWeekDaySessionsChange ? handleToggleWeekDay : undefined}
          onSelectDate={handleSelectDate}
        />

        <Dialog open={isDialogOpen} onOpenChange={open => !open && closeDialog()}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDateLabel ? `Configurar ${selectedDateLabel}` : 'Configurar dia selecionado'}
              </DialogTitle>
              <DialogDescription>
                Ajuste os intervalos de atendimento ou marque o dia como sem atendimento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {canRestoreDefault ? (
                <div className="bg-muted/40 rounded-md border p-3 text-xs">
                  <p className="font-medium">Configuração padrão</p>
                  <p className="text-muted-foreground">
                    {defaultSessionsPreview
                      .map(session => {
                        if (session.startTime && session.endTime) {
                          return `${session.startTime} - ${session.endTime} (${session.sessionCount})`
                        }
                        return `${session.sessionCount} sessão${session.sessionCount > 1 ? 's' : ''}`
                      })
                      .join(', ')}
                  </p>
                </div>
              ) : (
                <div className="bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                  Não há configuração padrão cadastrada para este dia da semana.
                </div>
              )}

              <div className="space-y-3">
                {editingSessions.length === 0 ? (
                  <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
                    Nenhum intervalo configurado. Este dia ficará sem atendimento.
                  </div>
                ) : (
                  editingSessions.map((session, index) => (
                    <div
                      key={`interval-${index}`}
                      className="bg-muted/20 flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-muted-foreground text-xs">Início</Label>
                          <Input
                            value={session.startTime}
                            onChange={event => handleSessionTimeChange(index, 'startTime', event.target.value)}
                            placeholder="00:00"
                            maxLength={5}
                            className="h-8 w-20 text-center text-sm"
                          />
                        </div>
                        <span className="text-muted-foreground hidden sm:inline">-</span>
                        <div className="flex items-center gap-2">
                          <Label className="text-muted-foreground text-xs">Fim</Label>
                          <Input
                            value={session.endTime}
                            onChange={event => handleSessionTimeChange(index, 'endTime', event.target.value)}
                            placeholder="00:00"
                            maxLength={5}
                            className="h-8 w-20 text-center text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-muted-foreground text-xs">Sessões</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={session.sessionCount}
                            onChange={event =>
                              handleSessionCountChange(index, Number.parseInt(event.target.value, 10) || 1)
                            }
                            className="h-8 w-20 text-center text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInterval(index)}
                        className="text-destructive hover:text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddInterval}
                  className="cursor-pointer">
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar intervalo
                </Button>
                {canRestoreDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreDefault}
                    className="cursor-pointer">
                    Restaurar padrão
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkNoAttendance}
                  className="cursor-pointer border-dashed">
                  Sem atendimento
                </Button>
              </div>
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-xs sm:text-sm">
                Total de sessões configuradas:{' '}
                <span className="text-foreground font-medium">{totalSessionsForSelectedDate}</span>
              </div>
              <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                {hasExistingException && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveException}
                    className="cursor-pointer">
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remover exceção
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="sm" className="cursor-pointer">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="button" size="sm" onClick={handleSaveException} className="cursor-pointer">
                  Salvar alterações
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {onWeekDaySessionsChange && (
          <div className="space-y-3">
            {weekDaySessions.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm">
                Clique no cabeçalho do dia da semana para selecionar os dias de atendimento.
              </p>
            ) : (
              <>
                <h3 className="text-center text-sm font-medium">Configuração por dia</h3>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {weekDaySessions.map(({ day, sessions, startTime, endTime }) => {
                    const weekDayInfo = weekDayHeaderItems.find(item => item.key === day)

                    return (
                      <div key={day} className="bg-muted/20 rounded border p-3">
                        {/* Mobile layout */}
                        <div className="flex flex-col items-center gap-2 sm:hidden">
                          <Label className="text-sm font-medium">{weekDayInfo?.fullName}</Label>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Label className="text-muted-foreground text-xs">Sessões:</Label>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                value={sessions}
                                onChange={event => {
                                  const value = parseInt(event.target.value, 10) || 1
                                  handleSessionsChange(day, clampSessions(value))
                                }}
                                className="h-7 w-12 text-center text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={startTime || ''}
                                onChange={event => handleTimeInputChange(day, event.target.value, 'start')}
                                placeholder="00:00"
                                maxLength={5}
                                className="h-7 w-16 flex-1 text-center text-xs"
                              />
                              <span>-</span>
                              <Input
                                type="text"
                                value={endTime || ''}
                                onChange={event => handleTimeInputChange(day, event.target.value, 'end')}
                                placeholder="00:00"
                                maxLength={5}
                                className="h-7 w-16 flex-1 text-center text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden items-center justify-center gap-4 sm:flex">
                          <Label className="text-sm font-medium">{weekDayInfo?.fullName}</Label>

                          <div className="flex items-center gap-1">
                            <Label className="text-muted-foreground text-xs">Sessões:</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={sessions}
                              onChange={event => {
                                const value = parseInt(event.target.value, 10) || 1
                                handleSessionsChange(day, clampSessions(value))
                              }}
                              className="h-7 w-12 text-center text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-2 md:flex-row">
                            <Label className="text-muted-foreground hidden text-xs lg:block">
                              Horários (opcional):
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={startTime || ''}
                                onChange={event => handleTimeInputChange(day, event.target.value, 'start')}
                                placeholder="00:00"
                                maxLength={5}
                                className="h-7 w-16 text-center text-xs"
                              />
                              <span>-</span>
                              <Input
                                type="text"
                                value={endTime || ''}
                                onChange={event => handleTimeInputChange(day, event.target.value, 'end')}
                                placeholder="00:00"
                                maxLength={5}
                                className="h-7 w-16 text-center text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
