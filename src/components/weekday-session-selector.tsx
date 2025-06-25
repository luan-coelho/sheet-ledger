'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { WeekDays, WeekdaySession } from '@/lib/spreadsheet-schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export type WeekdaySessionSelectorProps = {
  className?: string
  value?: WeekdaySession[]
  onChange?: (value: WeekdaySession[]) => void
}

export function WeekdaySessionSelector({ className, value = [], onChange }: WeekdaySessionSelectorProps) {
  const [selectedDays, setSelectedDays] = useState<WeekdaySession[]>(value)

  const weekdayItems = [
    { key: WeekDays.MONDAY, label: 'S', fullName: 'Segunda' },
    { key: WeekDays.TUESDAY, label: 'T', fullName: 'Terça' },
    { key: WeekDays.WEDNESDAY, label: 'Q', fullName: 'Quarta' },
    { key: WeekDays.THURSDAY, label: 'Q', fullName: 'Quinta' },
    { key: WeekDays.FRIDAY, label: 'S', fullName: 'Sexta' },
    { key: WeekDays.SATURDAY, label: 'S', fullName: 'Sábado' },
    { key: WeekDays.SUNDAY, label: 'D', fullName: 'Domingo' },
  ]

  // Sync with external value changes
  useEffect(() => {
    setSelectedDays(value)
  }, [value])

  function handleToggleDay(day: WeekDays) {
    const existingIndex = selectedDays.findIndex(item => item.day === day)
    let newSelectedDays: WeekdaySession[]

    if (existingIndex >= 0) {
      // Remove the day
      newSelectedDays = selectedDays.filter(item => item.day !== day)
    } else {
      // Add the day with default 4 sessions
      newSelectedDays = [...selectedDays, { day, sessions: 4 }]
    }

    setSelectedDays(newSelectedDays)
    onChange?.(newSelectedDays)
  }

  function handleSessionsChange(day: WeekDays, sessions: number) {
    const newSelectedDays = selectedDays.map(item => (item.day === day ? { ...item, sessions } : item))

    setSelectedDays(newSelectedDays)
    onChange?.(newSelectedDays)
  }

  function isDaySelected(day: WeekDays): boolean {
    return selectedDays.some(item => item.day === day)
  }

  const totalSessions = selectedDays.reduce((total, item) => total + item.sessions, 0)

  return (
    <div className={cn('space-y-4 p-3', className)}>
      {/* Day Selection */}
      <div>
        <div className="flex justify-center flex-wrap gap-2 sm:space-x-2 sm:gap-0">
          {weekdayItems.map(item => {
            const isSelected = isDaySelected(item.key)
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleDay(item.key)}
                className={cn(
                  'flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-md text-sm font-medium transition-colors',
                  'border border-input hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    : 'bg-background hover:bg-background',
                )}
                title={item.fullName}
                aria-label={item.fullName}
                aria-pressed={isSelected}>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-xs">{item.fullName.substring(0, 3)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sessions Configuration */}
      {selectedDays.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-sm font-medium text-center sm:text-left">Sessões por dia</Label>
            <Badge variant="secondary" className="self-center sm:self-auto">
              Total: {totalSessions} sessões
            </Badge>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {selectedDays.map(({ day, sessions }) => {
              const dayItem = weekdayItems.find(item => item.key === day)
              return (
                <div
                  key={day}
                  className="flex items-center justify-between space-x-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium truncate">{dayItem?.fullName}</Label>
                  </div>
                  <div className="w-16 sm:w-20">
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
                      className="text-center h-8 text-sm"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedDays.length > 0 && (
        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          {selectedDays.length} dia{selectedDays.length > 1 ? 's' : ''} selecionado{selectedDays.length > 1 ? 's' : ''}{' '}
          • {totalSessions} sessões no total
        </div>
      )}
    </div>
  )
}
