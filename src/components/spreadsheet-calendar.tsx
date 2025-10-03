'use client'

import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { formatDateToLocal } from '@/lib/date-utils'
import { generateSessionSchedule, groupSessionScheduleByDate, type SessionScheduleRecord } from '@/lib/schedule-utils'
import { WeekDays, type DateOverride, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

interface SpreadsheetCalendarProps {
  formData: SpreadsheetFormValues
  dateOverrides: DateOverride[]
  onChangeOverrides: (value: DateOverride[]) => void
  onClose?: () => void
}

type EditableOverride = DateOverride & { index?: number }

// Mapear os dias da semana para números que date-fns usa (0 = Domingo, 1 = Segunda, etc.)
const weekDayToNumber: Record<WeekDays, number> = {
  [WeekDays.SUNDAY]: 0,
  [WeekDays.MONDAY]: 1,
  [WeekDays.TUESDAY]: 2,
  [WeekDays.WEDNESDAY]: 3,
  [WeekDays.THURSDAY]: 4,
  [WeekDays.FRIDAY]: 5,
  [WeekDays.SATURDAY]: 6,
}

const dayNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTimeInput = (value: string): string => {
  const numbersOnly = value.replace(/\D/g, '')

  if (numbersOnly.length === 0) return ''
  if (numbersOnly.length <= 2) return numbersOnly

  return `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2, 4)}`
}

// Componente de calendário simplificado
function SimpleCalendar({
  scheduleByDate,
  formData,
  overrideDays,
  onCreateOverride,
  onEditOverride,
  onRemoveOverride,
}: {
  scheduleByDate: Map<string, SessionScheduleRecord[]>
  formData: SpreadsheetFormValues
  overrideDays: Set<string>
  onCreateOverride: (date: Date) => void
  onEditOverride: (overrideIndex: number) => void
  onRemoveOverride: (overrideIndex: number) => void
}) {
  const startDate = useMemo(() => {
    if (formData.startDate) {
      return new Date(formData.startDate + 'T00:00:00')
    }
    return new Date()
  }, [formData.startDate])

  const endDate = useMemo(() => {
    if (formData.endDate) {
      return new Date(formData.endDate + 'T00:00:00')
    }
    return new Date()
  }, [formData.endDate])

  // Verificar se o período abrange múltiplos meses
  const isMultipleMonths = useMemo(() => {
    return startDate.getMonth() !== endDate.getMonth() || startDate.getFullYear() !== endDate.getFullYear()
  }, [startDate, endDate])

  // Obter todos os meses no período
  const monthsInPeriod = useMemo(() => {
    if (!isMultipleMonths) {
      return [startDate]
    }

    return eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(endDate) })
  }, [startDate, endDate, isMultipleMonths])

  // Estado para controlar o mês atual sendo visualizado
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  const currentViewDate = monthsInPeriod[currentMonthIndex] || startDate

  const monthStart = startOfMonth(currentViewDate)
  const monthEnd = endOfMonth(currentViewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const isAttendanceDay = (date: Date) => scheduleByDate.has(formatDateKey(date))

  const getEntriesForDay = (date: Date): SessionScheduleRecord[] => {
    return scheduleByDate.get(formatDateKey(date)) ?? []
  }

  const getSessionsForDay = (date: Date) => {
    const entries = getEntriesForDay(date)
    if (entries.length > 0) {
      return entries.reduce((total, entry) => total + entry.sessions, 0)
    }

    const dayOfWeek = date.getDay()
    const weekDaySession = formData.weekDaySessions.find(session => weekDayToNumber[session.day] === dayOfWeek)
    return weekDaySession?.sessions || 0
  }

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
    <div className="bg-background rounded-lg border">
      {/* Header do calendário */}
      <div className="flex items-center justify-center border-b px-4 py-2">
        <div className="flex items-center gap-3">
          {isMultipleMonths && (
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={navigatePrevious}
              disabled={!canNavigatePrevious}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
          <h3 className="font-base font-medium">
            {format(currentViewDate, 'MMMM', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
          </h3>
          {isMultipleMonths && (
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={navigateNext}
              disabled={!canNavigateNext}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b">
        {dayNamesShort.map(day => (
          <div key={day} className="text-muted-foreground p-2 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dateKey = formatDateKey(day)
          const isCurrentMonth = isSameMonth(day, currentViewDate)
          const isAttendance = isAttendanceDay(day)
          const sessions = getSessionsForDay(day)
          const entriesForDay = getEntriesForDay(day)
          const overrideEntries = entriesForDay.filter(entry => entry.source === 'override')
          const defaultEntries = entriesForDay.filter(entry => entry.source === 'default')

          // Obter horários se for dia de atendimento
          const dayOfWeek = day.getDay()
          const weekDaySession = formData.weekDaySessions.find(session => weekDayToNumber[session.day] === dayOfWeek)
          const isOverrideDay = overrideDays.has(dateKey)
          const isWithinPeriod = day >= startDate && day <= endDate

          const showDefaultTimes = overrideEntries.length === 0 && weekDaySession
          const availableEntries = overrideEntries.length > 0 ? overrideEntries : defaultEntries

          return (
            <div
              key={index}
              className={`h-24 border-r border-b p-1 transition-colors last:border-r-0 ${
                !isCurrentMonth ? 'bg-muted dark:bg-muted/30 text-muted-foreground' : ''
              } ${
                isAttendance
                  ? 'bg-primary/20 border-primary/30 text-foreground'
                  : isCurrentMonth
                    ? 'bg-background hover:bg-background/50'
                    : ''
              } ${isOverrideDay ? 'ring-primary/40 ring-1' : ''}`}>
              <div className="flex h-full flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-lg font-semibold">{format(day, 'd')}</span>
                  {isWithinPeriod && isCurrentMonth && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => onCreateOverride(day)}
                      aria-label="Adicionar ajuste para o dia">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {isAttendance && (
                  <div className="flex flex-1 flex-col gap-1">
                    {sessions > 0 && (
                      <div className="bg-primary/80 text-background rounded px-1 text-center text-[11px] font-bold">
                        {sessions} {sessions > 1 ? 'sessões' : 'sessão'}
                      </div>
                    )}

                    <div className="relative flex flex-1 flex-col gap-1 overflow-auto pr-0.5">
                      {availableEntries.length === 0 && showDefaultTimes && weekDaySession?.startTime && (
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span>{weekDaySession.startTime}</span>
                          <span>-</span>
                          <span>{weekDaySession.endTime}</span>
                        </div>
                      )}

                      {availableEntries.map((entry, entryIndex) => (
                        <div
                          key={`${dateKey}-${entryIndex}`}
                          className={`flex items-center justify-between gap-1 rounded border px-1 py-0.5 text-[11px] ${
                            entry.source === 'override'
                              ? 'border-primary/70 bg-primary/10'
                              : 'border-border bg-background/70'
                          }`}>
                          <div className="flex items-center gap-1">
                            <span>{entry.startTime ?? '--:--'}</span>
                            <span>-</span>
                            <span>{entry.endTime ?? '--:--'}</span>
                          </div>
                          {entry.source === 'override' && entry.overrideIndex !== undefined && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-primary transition"
                                onClick={() => onEditOverride(entry.overrideIndex!)}
                                aria-label="Editar ajuste">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive transition"
                                onClick={() => onRemoveOverride(entry.overrideIndex!)}
                                aria-label="Remover ajuste">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Indicador de múltiplos meses */}
      {isMultipleMonths && (
        <div className="text-muted-foreground p-3 text-center text-sm">
          Período abrange {monthsInPeriod.length} mês{monthsInPeriod.length > 1 ? 'es' : ''}. Use as setas para navegar.
        </div>
      )}
    </div>
  )
}

export function SpreadsheetCalendar({ formData, dateOverrides, onChangeOverrides, onClose }: SpreadsheetCalendarProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [draftOverride, setDraftOverride] = useState<EditableOverride | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)

  const periodStartDate = formData.startDate ? new Date(formData.startDate + 'T00:00:00') : undefined
  const periodEndDate = formData.endDate ? new Date(formData.endDate + 'T00:00:00') : undefined

  const closeEditor = () => {
    setIsEditorOpen(false)
    setDraftOverride(null)
    setEditorError(null)
  }

  const getDefaultSessionForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    return formData.weekDaySessions.find(session => weekDayToNumber[session.day] === dayOfWeek)
  }

  const handleCreateOverride = (date: Date) => {
    const defaultSession = getDefaultSessionForDate(date)
    const baseDate = formatDateToLocal(date)

    const newOverride: EditableOverride = {
      startDate: baseDate,
      endDate: baseDate,
      startTime: defaultSession?.startTime ?? '',
      endTime: defaultSession?.endTime ?? '',
      sessions: defaultSession?.sessions ?? 1,
    }

    setDraftOverride(newOverride)
    setEditorError(null)
    setIsEditorOpen(true)
  }

  const handleEditOverride = (overrideIndex: number) => {
    const override = dateOverrides[overrideIndex]
    if (!override) return

    setDraftOverride({ ...override, index: overrideIndex })
    setEditorError(null)
    setIsEditorOpen(true)
  }

  const handleRemoveOverride = (overrideIndex: number) => {
    const next = dateOverrides.filter((_, idx) => idx !== overrideIndex)
    onChangeOverrides(next)

    if (draftOverride && typeof draftOverride.index === 'number') {
      if (draftOverride.index === overrideIndex) {
        closeEditor()
      } else if (draftOverride.index > overrideIndex) {
        setDraftOverride({ ...draftOverride, index: draftOverride.index - 1 })
      }
    }
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return

    const formatted = formatDateToLocal(date)

    setDraftOverride(prev => {
      if (!prev) return prev
      const next: EditableOverride = {
        ...prev,
        startDate: formatted,
      }

      if (!prev.endDate) {
        next.endDate = formatted
      }

      return next
    })
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return
    const formatted = formatDateToLocal(date)
    setDraftOverride(prev => (prev ? { ...prev, endDate: formatted } : prev))
  }

  const handleApplySameDateRange = () => {
    setDraftOverride(prev => {
      if (!prev) return prev
      return {
        ...prev,
        endDate: prev.startDate,
      }
    })
  }

  const handleClearEndDate = () => {
    setDraftOverride(prev => (prev ? { ...prev, endDate: undefined } : prev))
  }

  const handleDraftTimeChange = (field: 'startTime' | 'endTime', rawValue: string) => {
    setDraftOverride(prev => {
      if (!prev) return prev

      const formatted = formatTimeInput(rawValue)
      if (formatted.length > 0) {
        const [hours, minutes] = formatted.split(':').map(Number)
        if (formatted.length === 5 && (hours > 23 || minutes > 59)) {
          return prev
        }
      }

      return {
        ...prev,
        [field]: formatted,
      }
    })
  }

  const handleDraftSessionsChange = (rawValue: string) => {
    setDraftOverride(prev => {
      if (!prev) return prev
      const parsed = parseInt(rawValue, 10)

      if (Number.isNaN(parsed)) {
        return {
          ...prev,
          sessions: undefined,
        }
      }

      const clamped = Math.max(1, Math.min(10, parsed))
      return {
        ...prev,
        sessions: clamped,
      }
    })
  }

  const handleSaveOverride = () => {
    if (!draftOverride) return

    if (!draftOverride.startDate || !draftOverride.startTime || !draftOverride.endTime) {
      setEditorError('Preencha data e horários do ajuste.')
      return
    }

    const normalized: DateOverride = {
      startDate: draftOverride.startDate,
      endDate: draftOverride.endDate && draftOverride.endDate.length > 0 ? draftOverride.endDate : undefined,
      startTime: draftOverride.startTime,
      endTime: draftOverride.endTime,
      sessions: draftOverride.sessions,
    }

    const next = [...dateOverrides]
    if (typeof draftOverride.index === 'number') {
      next[draftOverride.index] = normalized
    } else {
      next.push(normalized)
    }

    onChangeOverrides(next)
    closeEditor()
  }

  // Gerar os registros completos de atendimento (dias e horários)
  const scheduleEntries = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return [] as SessionScheduleRecord[]
    }

    const startDate = new Date(formData.startDate + 'T00:00:00')
    const endDate = new Date(formData.endDate + 'T00:00:00')

    return generateSessionSchedule(startDate, endDate, {
      weekDaySessions: formData.weekDaySessions,
      dateOverrides,
    })
  }, [formData.startDate, formData.endDate, formData.weekDaySessions, dateOverrides])

  const scheduleByDate = useMemo(() => groupSessionScheduleByDate(scheduleEntries), [scheduleEntries])

  const attendanceDates = useMemo(() => {
    return Array.from(scheduleByDate.values())
      .map(entries => entries[0]?.date)
      .filter((date): date is Date => Boolean(date))
  }, [scheduleByDate])

  const totalSessions = useMemo(() => {
    return scheduleEntries.reduce((total, entry) => total + entry.sessions, 0)
  }, [scheduleEntries])

  const overrideDays = useMemo(() => {
    const keys = new Set<string>()

    dateOverrides.forEach(override => {
      if (!override.startDate) {
        return
      }

      const start = new Date(override.startDate + 'T00:00:00')
      const end = new Date((override.endDate ?? override.startDate) + 'T00:00:00')

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return
      }

      eachDayOfInterval({ start, end }).forEach(date => {
        keys.add(formatDateKey(date))
      })
    })

    return keys
  }, [dateOverrides])

  if (!formData.startDate || !formData.endDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">
            Selecione as datas de início e fim para visualizar o calendário
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">Calendário de Atendimentos</CardTitle>
          {onClose && (
            <Button className="cursor-pointer" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
                {format(new Date(formData.startDate + 'T00:00:00'), 'dd/MM', { locale: ptBR })} -{' '}
                {format(new Date(formData.endDate + 'T00:00:00'), 'dd/MM', { locale: ptBR })}
              </div>
              <div className="text-muted-foreground text-sm">Período</div>
            </div>
          </div>

          {/* Calendário visual simplificado */}
          <SimpleCalendar
            scheduleByDate={scheduleByDate}
            formData={formData}
            overrideDays={overrideDays}
            onCreateOverride={handleCreateOverride}
            onEditOverride={handleEditOverride}
            onRemoveOverride={handleRemoveOverride}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={open => (!open ? closeEditor() : null)}>
        {draftOverride && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {typeof draftOverride.index === 'number' ? 'Editar ajuste' : 'Adicionar ajuste'}
              </DialogTitle>
              <DialogDescription>
                Configure horários específicos para datas que fogem da programação padrão.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Data inicial</Label>
                  <DatePicker
                    className="h-9 w-full"
                    date={draftOverride.startDate ? new Date(draftOverride.startDate + 'T00:00:00') : undefined}
                    onSelect={handleStartDateSelect}
                    fromDate={periodStartDate}
                    toDate={periodEndDate}
                    format="dd/MM/yyyy"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs font-medium">Data final</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={handleApplySameDateRange}>
                        Igual à inicial
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={handleClearEndDate}>
                        Limpar
                      </Button>
                    </div>
                  </div>
                  <DatePicker
                    className="h-9 w-full"
                    date={draftOverride.endDate ? new Date(draftOverride.endDate + 'T00:00:00') : undefined}
                    onSelect={handleEndDateSelect}
                    fromDate={
                      draftOverride.startDate ? new Date(draftOverride.startDate + 'T00:00:00') : periodStartDate
                    }
                    toDate={periodEndDate}
                    placeholder="Opcional"
                    format="dd/MM/yyyy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Início</Label>
                  <Input
                    value={draftOverride.startTime}
                    maxLength={5}
                    placeholder="00:00"
                    className="h-9 text-center text-sm"
                    onChange={event => handleDraftTimeChange('startTime', event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Fim</Label>
                  <Input
                    value={draftOverride.endTime}
                    maxLength={5}
                    placeholder="00:00"
                    className="h-9 text-center text-sm"
                    onChange={event => handleDraftTimeChange('endTime', event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium">Sessões</Label>
                <Input
                  type="number"
                  value={draftOverride.sessions ?? ''}
                  min={1}
                  max={10}
                  className="h-9 text-center text-sm"
                  onChange={event => handleDraftSessionsChange(event.target.value)}
                />
              </div>

              {editorError && <p className="text-destructive text-sm">{editorError}</p>}
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {typeof draftOverride.index === 'number' && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive justify-start"
                  onClick={() => handleRemoveOverride(draftOverride.index!)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remover ajuste
                </Button>
              )}

              <div className="flex w-full justify-end gap-2 sm:w-auto">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSaveOverride}>
                  Salvar ajuste
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
