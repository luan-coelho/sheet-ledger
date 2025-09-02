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
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { WeekDays, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

interface SpreadsheetCalendarProps {
  formData: SpreadsheetFormValues
  onClose?: () => void
}

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

// Componente de calendário simplificado
function SimpleCalendar({ attendanceDates, formData }: { attendanceDates: Date[]; formData: SpreadsheetFormValues }) {
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

  const isAttendanceDay = (date: Date) => {
    return attendanceDates.some(attendanceDate => isSameDay(date, attendanceDate))
  }

  const getSessionsForDay = (date: Date) => {
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
    <div className="rounded-lg border bg-white">
      {/* Header do calendário */}
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="text-base font-semibold">{format(currentViewDate, 'MMMM yyyy', { locale: ptBR })}</h3>
        <div className="flex items-center gap-2">
          {isMultipleMonths && (
            <>
              <Button variant="ghost" size="sm" onClick={navigatePrevious} disabled={!canNavigatePrevious}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <div className="text-muted-foreground px-2 text-xs">
                {currentMonthIndex + 1} de {monthsInPeriod.length}
              </div>
              <Button variant="ghost" size="sm" onClick={navigateNext} disabled={!canNavigateNext}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b">
        {dayNamesShort.map(day => (
          <div key={day} className="text-muted-foreground p-1 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentViewDate)
          const isAttendance = isAttendanceDay(day)
          const sessions = getSessionsForDay(day)

          // Obter horários se for dia de atendimento
          const dayOfWeek = day.getDay()
          const weekDaySession = formData.weekDaySessions.find(session => weekDayToNumber[session.day] === dayOfWeek)
          const startTime = weekDaySession?.startTime
          const endTime = weekDaySession?.endTime

          return (
            <div
              key={index}
              className={`h-20 border-r border-b p-1 last:border-r-0 ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''} ${
                isAttendance
                  ? 'bg-primary/20 border-primary/90 text-black'
                  : isCurrentMonth
                    ? 'bg-white hover:bg-gray-50'
                    : ''
              } `}>
              <div className="flex h-full flex-col">
                <div className={`text-center text-base font-medium`}>{format(day, 'd')}</div>
                {isAttendance && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    {sessions > 0 && (
                      <div className="bg-primary rounded px-1 text-xs font-bold text-white">
                        {sessions} {sessions > 1 ? 'sessões' : 'sessão'}
                      </div>
                    )}
                    {startTime && endTime && (
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <div className="text-xs font-medium">{startTime}</div>
                        <span className="text-xs font-medium">-</span>
                        <div className="text-xs font-medium">{endTime}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Indicador de múltiplos meses */}
      {isMultipleMonths && (
        <div className="text-muted-foreground border-t p-1 text-center text-xs">
          Período abrange {monthsInPeriod.length} mês{monthsInPeriod.length > 1 ? 'es' : ''}. Use as setas para navegar.
        </div>
      )}
    </div>
  )
}

export function SpreadsheetCalendar({ formData, onClose }: SpreadsheetCalendarProps) {
  // Calcular as datas de atendimento baseadas no formulário
  const attendanceDates = useMemo(() => {
    if (!formData.startDate || !formData.endDate || formData.weekDaySessions.length === 0) {
      return []
    }

    const startDate = new Date(formData.startDate + 'T00:00:00')
    const endDate = new Date(formData.endDate + 'T00:00:00')

    // Obter todos os dias no período
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })

    // Obter os dias da semana selecionados
    const selectedWeekDays = new Set(formData.weekDaySessions.map(session => weekDayToNumber[session.day]))

    // Filtrar apenas os dias que estão nos dias da semana selecionados
    return allDates.filter(date => selectedWeekDays.has(date.getDay()))
  }, [formData.startDate, formData.endDate, formData.weekDaySessions])

  const totalSessions = useMemo(() => {
    return attendanceDates.reduce((total, date) => {
      const dayOfWeek = date.getDay()
      const weekDaySession = formData.weekDaySessions.find(session => weekDayToNumber[session.day] === dayOfWeek)
      return total + (weekDaySession?.sessions || 1)
    }, 0)
  }, [attendanceDates, formData.weekDaySessions])

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendário de Atendimentos
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
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
        <SimpleCalendar attendanceDates={attendanceDates} formData={formData} />
      </CardContent>
    </Card>
  )
}
