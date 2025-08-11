'use client'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimePickerSelector } from '@/components/ui/time-picker'

import { WeekDays, WeekdaySession } from '@/lib/spreadsheet-schema'
import { cn } from '@/lib/utils'

export type WeekdaySessionSelectorProps = {
  className?: string
  value?: WeekdaySession[]
  onChange?: (value: WeekdaySession[]) => void
}

export function WeekdaySessionSelector({ className, value = [], onChange }: WeekdaySessionSelectorProps) {
  const weekdayItems = [
    { key: WeekDays.MONDAY, label: 'S', fullName: 'Segunda' },
    { key: WeekDays.TUESDAY, label: 'T', fullName: 'Terça' },
    { key: WeekDays.WEDNESDAY, label: 'Q', fullName: 'Quarta' },
    { key: WeekDays.THURSDAY, label: 'Q', fullName: 'Quinta' },
    { key: WeekDays.FRIDAY, label: 'S', fullName: 'Sexta' },
    { key: WeekDays.SATURDAY, label: 'S', fullName: 'Sábado' },
    { key: WeekDays.SUNDAY, label: 'D', fullName: 'Domingo' },
  ]

  function handleToggleDay(day: WeekDays) {
    const existingIndex = value.findIndex(item => item.day === day)
    let newSelectedDays: WeekdaySession[]

    if (existingIndex >= 0) {
      // Remove the day
      newSelectedDays = value.filter(item => item.day !== day)
    } else {
      // Add the day with default 4 sessions and default times
      newSelectedDays = [...value, { day, sessions: 4, startTime: '08:00', endTime: '17:00' }]
    }

    onChange?.(newSelectedDays)
  }

  function handleSessionsChange(day: WeekDays, sessions: number) {
    const newSelectedDays = value.map(item => (item.day === day ? { ...item, sessions } : item))

    onChange?.(newSelectedDays)
  }

  function handleStartTimeChange(day: WeekDays, startTime: string) {
    const newSelectedDays = value.map(item => (item.day === day ? { ...item, startTime } : item))

    onChange?.(newSelectedDays)
  }

  function handleEndTimeChange(day: WeekDays, endTime: string) {
    const newSelectedDays = value.map(item => (item.day === day ? { ...item, endTime } : item))

    onChange?.(newSelectedDays)
  }

  function isDaySelected(day: WeekDays): boolean {
    return value.some(item => item.day === day)
  }

  const totalSessions = value.reduce((total, item) => total + item.sessions, 0)

  return (
    <div className={cn('space-y-4 p-3', className)}>
      {/* Day Selection */}
      <div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-0 sm:space-x-2">
          {weekdayItems.map(item => {
            const isSelected = isDaySelected(item.key)
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleDay(item.key)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors sm:h-10 sm:w-10',
                  'border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring border focus-visible:ring-2 focus-visible:outline-none',
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    : 'bg-background hover:bg-background',
                )}
                title={item.fullName}
                aria-label={item.fullName}
                aria-pressed={isSelected}>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="text-xs sm:hidden">{item.fullName.substring(0, 3)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sessions Configuration */}
      {value.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-center text-sm font-medium sm:text-left">Configuração por dia</Label>
            <Badge variant="secondary" className="self-center sm:self-auto">
              Total: {totalSessions} sessões
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {value.map(({ day, sessions, startTime, endTime }) => {
              const dayItem = weekdayItems.find(item => item.key === day)
              return (
                <div
                  key={day}
                  className="bg-muted/30 space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{dayItem?.fullName}</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Sessões:</Label>
                      <div className="w-16">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={sessions}
                          onChange={e => {
                            const value = parseInt(e.target.value) || 1
                            const clampedValue = Math.max(1, Math.min(10, value))
                            handleSessionsChange(day, clampedValue)
                          }}
                          className="h-8 text-center text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Início</Label>
                      <TimePickerSelector
                        value={startTime}
                        onChange={(time) => handleStartTimeChange(day, time)}
                        placeholder="Horário início"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Fim</Label>
                      <TimePickerSelector
                        value={endTime}
                        onChange={(time) => handleEndTimeChange(day, time)}
                        placeholder="Horário fim"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div className="text-muted-foreground text-center text-xs sm:text-sm">
          {value.length} dia{value.length > 1 ? 's' : ''} selecionado{value.length > 1 ? 's' : ''}{' '}
          • {totalSessions} sessões no total
        </div>
      )}
    </div>
  )
}
