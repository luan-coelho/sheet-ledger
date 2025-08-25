'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import { TimePickerInput } from './time-picker-input'

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="flex h-10 items-center">
        <span className="text-sm">:</span>
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
        />
      </div>
    </div>
  )
}

interface TimePickerSelectorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePickerSelector({ value, onChange, placeholder, className }: TimePickerSelectorProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number)
      const newDate = new Date()
      newDate.setHours(hours, minutes, 0, 0)
      return newDate
    }
    return undefined
  })

  React.useEffect(() => {
    if (value && value !== '') {
      const [hours, minutes] = value.split(':').map(Number)
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date()
        newDate.setHours(hours, minutes, 0, 0)
        // Only update if the date is actually different to avoid loops
        setDate(prevDate => {
          if (!prevDate || prevDate.getHours() !== hours || prevDate.getMinutes() !== minutes) {
            return newDate
          }
          return prevDate
        })
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  function handleTimeChange(type: 'hour' | 'minute', newValue: string) {
    const currentDate = date || new Date()
    const newDate = new Date(currentDate)

    if (type === 'hour') {
      const hour = parseInt(newValue, 10)
      newDate.setHours(hour)
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(newValue, 10))
    }

    setDate(newDate)

    // Call onChange immediately when user interacts
    if (onChange) {
      const hours = String(newDate.getHours()).padStart(2, '0')
      const minutes = String(newDate.getMinutes()).padStart(2, '0')
      onChange(`${hours}:${minutes}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-center text-left font-normal', !date && 'text-muted-foreground', className)}>
          {date ? (
            `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
          ) : (
            <span className="text-center">{placeholder || 'Selecione um horário'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col divide-y sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="max-h-[200px] w-64 overflow-y-auto sm:w-auto">
            <div className="flex p-2 sm:flex-col">
              <div className="text-muted-foreground p-2 text-center text-xs font-medium">Horas</div>
              {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                <Button
                  key={hour}
                  size="sm"
                  variant={date && date.getHours() === hour ? 'default' : 'ghost'}
                  className="shrink-0 justify-center sm:w-full"
                  onClick={() => handleTimeChange('hour', hour.toString())}>
                  {String(hour).padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
          <div className="max-h-[200px] w-64 overflow-y-auto sm:w-auto">
            <div className="flex p-2 sm:flex-col">
              <div className="text-muted-foreground p-2 text-center text-xs font-medium">Minutos</div>
              {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                <Button
                  key={minute}
                  size="sm"
                  variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                  className="shrink-0 justify-center sm:w-full"
                  onClick={() => handleTimeChange('minute', minute.toString())}>
                  {String(minute).padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimePickerDemoProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function TimePickerDemo({ value, onChange, placeholder, className }: TimePickerDemoProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number)
      const newDate = new Date()
      newDate.setHours(hours, minutes, 0, 0)
      return newDate
    }
    return undefined
  })

  React.useEffect(() => {
    if (value && value !== '') {
      const [hours, minutes] = value.split(':').map(Number)
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date()
        newDate.setHours(hours, minutes, 0, 0)
        // Only update if the date is actually different to avoid loops
        setDate(prevDate => {
          if (!prevDate || prevDate.getHours() !== hours || prevDate.getMinutes() !== minutes) {
            return newDate
          }
          return prevDate
        })
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  // Handle direct time changes and call onChange immediately
  const handleDirectTimeChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && onChange) {
      const hours = String(newDate.getHours()).padStart(2, '0')
      const minutes = String(newDate.getMinutes()).padStart(2, '0')
      onChange(`${hours}:${minutes}`)
    }
  }

  return (
    <div className={cn('bg-background flex items-center rounded-md border px-3 py-2', className)}>
      {date ? (
        <TimePicker date={date} setDate={handleDirectTimeChange} />
      ) : (
        <span className="text-muted-foreground text-sm">{placeholder || 'Selecione um horário'}</span>
      )}
    </div>
  )
}
