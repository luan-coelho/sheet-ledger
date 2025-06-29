'use client'

import { useState } from 'react'

import { WeekDays } from '@/lib/spreadsheet-schema'
import { cn } from '@/lib/utils'

export type WeekdaySelectorProps = {
  className?: string
  value?: WeekDays[]
  onChange?: (value: WeekDays[]) => void
}

export function WeekdaySelector({ className, value = [], onChange }: WeekdaySelectorProps) {
  const [selectedDays, setSelectedDays] = useState<WeekDays[]>(value)

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
    const isSelected = selectedDays.includes(day)
    let newSelectedDays: WeekDays[]

    if (isSelected) {
      newSelectedDays = selectedDays.filter(selectedDay => selectedDay !== day)
    } else {
      newSelectedDays = [...selectedDays, day]
    }

    setSelectedDays(newSelectedDays)
    onChange?.(newSelectedDays)
  }

  return (
    <div className={cn('flex justify-center space-x-2', className)}>
      {weekdayItems.map(item => {
        const isSelected = selectedDays.includes(item.key)
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleToggleDay(item.key)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors',
              'border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring border focus-visible:ring-2 focus-visible:outline-none',
              isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : 'bg-background hover:bg-background',
            )}
            title={item.fullName}
            aria-label={item.fullName}
            aria-pressed={isSelected}>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
