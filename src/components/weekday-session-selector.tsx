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
    { key: WeekDays.MONDAY, label: 'SEG', fullName: 'Segunda' },
    { key: WeekDays.TUESDAY, label: 'TER', fullName: 'Terça' },
    { key: WeekDays.WEDNESDAY, label: 'QUA', fullName: 'Quarta' },
    { key: WeekDays.THURSDAY, label: 'QUI', fullName: 'Quinta' },
    { key: WeekDays.FRIDAY, label: 'SEX', fullName: 'Sexta' },
    { key: WeekDays.SATURDAY, label: 'SAB', fullName: 'Sábado' },
    { key: WeekDays.SUNDAY, label: 'DOM', fullName: 'Domingo' },
  ]

  function handleToggleDay(day: WeekDays) {
    const existingIndex = value.findIndex(item => item.day === day)
    let newSelectedDays: WeekdaySession[]

    if (existingIndex >= 0) {
      // Remove the day
      newSelectedDays = value.filter(item => item.day !== day)
    } else {
      // Add the day with default 4 sessions and no default times
      newSelectedDays = [...value, { day, sessions: 4 }]
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
    <div className={cn('space-y-3 p-2', className)}>
      {/* Day Selection */}
      <div className="flex flex-wrap justify-center gap-1">
        {weekdayItems.map(item => {
          const isSelected = isDaySelected(item.key)
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggleDay(item.key)}
              className={cn(
                'flex h-8 w-12 items-center justify-center rounded text-xs font-medium transition-colors',
                'border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring border focus-visible:ring-1 focus-visible:outline-none',
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  : 'bg-background hover:bg-background',
              )}
              title={item.fullName}
              aria-label={item.fullName}
              aria-pressed={isSelected}>
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Sessions Configuration */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Configuração</Label>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {totalSessions} sessões
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {value.map(({ day, sessions, startTime, endTime }) => {
              const dayItem = weekdayItems.find(item => item.key === day)
              return (
                <div key={day} className="bg-muted/20 rounded border p-3">
                  {/* Mobile layout - vertical stack */}
                  <div className="flex flex-col items-center gap-2 sm:hidden">
                    <Label className="text-sm font-medium">{dayItem?.fullName}</Label>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-muted-foreground text-xs">Sessões:</Label>
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
                          className="h-7 w-12 text-center text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <TimePickerSelector
                          value={startTime || ''}
                          onChange={time => handleStartTimeChange(day, time)}
                          placeholder="Início"
                          className="h-7 w-16 flex-1 text-xs"
                        />
                        <span>-</span>
                        <TimePickerSelector
                          value={endTime || ''}
                          onChange={time => handleEndTimeChange(day, time)}
                          placeholder="Fim"
                          className="h-7 w-16 flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout - horizontal */}
                  <div className="hidden items-center justify-center gap-4 sm:flex">
                    <Label className="w-16 flex-shrink-0 text-sm font-medium">{dayItem?.fullName}</Label>

                    <div className="flex items-center gap-1">
                      <Label className="text-muted-foreground text-xs">Sessões:</Label>
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
                        className="h-7 w-12 text-center text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 md:flex-row">
                      <Label className="text-muted-foreground hidden text-xs lg:block">Horários (opcional):</Label>
                      <div className="space-x-2">
                        <TimePickerSelector
                          value={startTime || ''}
                          onChange={time => handleStartTimeChange(day, time)}
                          placeholder="Início"
                          className="h-7 w-16 text-xs"
                        />
                        <span>-</span>
                        <TimePickerSelector
                          value={endTime || ''}
                          onChange={time => handleEndTimeChange(day, time)}
                          placeholder="Fim"
                          className="h-7 w-16 text-xs"
                        />
                      </div>
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
        <div className="text-muted-foreground text-center text-xs">
          {value.length} dia{value.length > 1 ? 's' : ''} • {totalSessions} sessões
        </div>
      )}
    </div>
  )
}
