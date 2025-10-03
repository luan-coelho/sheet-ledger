import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { formatDateToLocal } from '@/lib/date-utils'
import type { DateOverride } from '@/lib/spreadsheet-schema'

interface DateOverridesEditorProps {
  value?: DateOverride[]
  onChange?: (value: DateOverride[]) => void
  periodStart?: string
  periodEnd?: string
}

function formatTimeInput(value: string): string {
  const numbersOnly = value.replace(/\D/g, '')

  if (numbersOnly.length === 0) return ''
  if (numbersOnly.length <= 2) return numbersOnly

  return `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2, 4)}`
}

export function DateOverridesEditor({ value = [], onChange, periodStart, periodEnd }: DateOverridesEditorProps) {
  const baseStartDate = useMemo(() => (periodStart ? new Date(periodStart + 'T00:00:00') : undefined), [periodStart])
  const baseEndDate = useMemo(() => (periodEnd ? new Date(periodEnd + 'T00:00:00') : undefined), [periodEnd])

  const updateOverride = (index: number, partial: Partial<DateOverride>) => {
    const nextValue = value.map((item, idx) => (idx === index ? { ...item, ...partial } : item))
    onChange?.(nextValue)
  }

  const handleDateSelect = (index: number, field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (!date) return
    const formatted = formatDateToLocal(date)
    updateOverride(index, { [field]: formatted })
  }

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', rawValue: string) => {
    const formatted = formatTimeInput(rawValue)
    if (formatted.length > 0) {
      const [hours, minutes] = formatted.split(':').map(Number)
      if (formatted.length === 5 && (hours > 23 || minutes > 59)) {
        return
      }
    }
    updateOverride(index, { [field]: formatted })
  }

  const handleSessionsChange = (index: number, rawValue: string) => {
    const parsed = parseInt(rawValue, 10)
    if (Number.isNaN(parsed)) {
      updateOverride(index, { sessions: undefined })
      return
    }

    const clamped = Math.max(1, Math.min(10, parsed))
    updateOverride(index, { sessions: clamped })
  }

  const handleRemove = (index: number) => {
    const nextValue = value.filter((_, idx) => idx !== index)
    onChange?.(nextValue)
  }

  const handleAdd = () => {
    const defaultDate = periodStart || periodEnd || ''
    const newOverride: DateOverride = {
      startDate: defaultDate,
      endDate: defaultDate || undefined,
      startTime: '',
      endTime: '',
      sessions: 1,
    }
    onChange?.([...value, newOverride])
  }

  return (
    <div className="bg-muted/30 space-y-4 rounded-lg border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Ajustes por data (opcional)</h3>
          <p className="text-muted-foreground text-xs">
            Adicione horários específicos para datas ou intervalos que diferem da programação padrão.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd} className="self-start">
          <Plus className="mr-1 h-4 w-4" />
          Adicionar ajuste
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-muted-foreground text-xs">
          Nenhum ajuste cadastrado. Utilize o botão acima para adicionar horários específicos.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((override, index) => {
            const startDate = override.startDate ? new Date(override.startDate + 'T00:00:00') : undefined
            const endDate = override.endDate ? new Date(override.endDate + 'T00:00:00') : undefined

            return (
              <div
                key={`${override.startDate}-${override.startTime}-${index}`}
                className="bg-background rounded border p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-end">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Data inicial</Label>
                    <DatePicker
                      className="h-9 w-full"
                      date={startDate}
                      onSelect={date => handleDateSelect(index, 'startDate', date)}
                      placeholder="Selecione a data"
                      fromDate={baseStartDate}
                      toDate={baseEndDate}
                      format="dd/MM/yyyy"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Data final</Label>
                    <DatePicker
                      className="h-9 w-full"
                      date={endDate}
                      onSelect={date => handleDateSelect(index, 'endDate', date)}
                      placeholder="Opcional (mesma data)"
                      fromDate={startDate ?? baseStartDate}
                      toDate={baseEndDate}
                      format="dd/MM/yyyy"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Início</Label>
                    <Input
                      type="text"
                      value={override.startTime}
                      maxLength={5}
                      placeholder="00:00"
                      className="h-9 text-center text-xs"
                      onChange={event => handleTimeChange(index, 'startTime', event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Fim</Label>
                    <Input
                      type="text"
                      value={override.endTime}
                      maxLength={5}
                      placeholder="00:00"
                      className="h-9 text-center text-xs"
                      onChange={event => handleTimeChange(index, 'endTime', event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Sessões</Label>
                    <Input
                      type="number"
                      value={override.sessions ?? ''}
                      min={1}
                      max={10}
                      className="h-9 text-center text-xs"
                      onChange={event => handleSessionsChange(index, event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleRemove(index)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
