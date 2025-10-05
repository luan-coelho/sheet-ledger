'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  insertTherapyPriceHistorySchema,
  TherapyPriceHistoryFormValues,
  TherapyPriceHistoryWithFormatted,
} from '@/app/db/schemas/therapy-price-history-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreateTherapyPriceHistory, useUpdateTherapyPriceHistory } from '@/hooks/use-therapy-price-history'

interface TherapyPriceFormProps {
  therapyId: string
  priceHistory?: TherapyPriceHistoryWithFormatted
  onSuccess?: () => void
  onCancel?: () => void
}

// Obtém competência atual no formato yyyy-MM
function getCurrentCompetence(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Função para formatar MM/yyyy
function formatCompetenceDisplay(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length === 0) return ''
  if (numbers.length <= 2) return numbers
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 6)}`
}

// Converte MM/yyyy para yyyy-MM
function competenceDisplayToStorage(display: string): string {
  const numbers = display.replace(/\D/g, '')
  if (numbers.length !== 6) return ''
  const month = numbers.slice(0, 2)
  const year = numbers.slice(2, 6)
  return `${year}-${month}`
}

// Converte yyyy-MM para MM/yyyy
function competenceStorageToDisplay(storage: string): string {
  if (!storage || !/^\d{4}-\d{2}$/.test(storage)) return ''
  const [year, month] = storage.split('-')
  return `${month}/${year}`
}

// Formata número para moeda brasileira
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Remove formatação de moeda e retorna número
function parseCurrency(value: string): number {
  const numbers = value.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(numbers) || 0
}

// Formata valor enquanto digita (adiciona R$ e formatação automática)
function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''

  const amount = parseInt(numbers) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function TherapyPriceForm({ therapyId, priceHistory, onSuccess, onCancel }: TherapyPriceFormProps) {
  const isEditing = !!priceHistory

  const [competenceDisplay, setCompetenceDisplay] = useState('')
  const [valueDisplay, setValueDisplay] = useState('')

  const form = useForm<TherapyPriceHistoryFormValues>({
    resolver: zodResolver(insertTherapyPriceHistorySchema),
    defaultValues: {
      therapyId,
      competence: priceHistory?.competence || getCurrentCompetence(),
      value: priceHistory?.value || 0,
    },
  })

  const createMutation = useCreateTherapyPriceHistory()
  const updateMutation = useUpdateTherapyPriceHistory()

  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (priceHistory) {
      form.reset({
        therapyId,
        competence: priceHistory.competence,
        value: priceHistory.value,
      })
      setCompetenceDisplay(competenceStorageToDisplay(priceHistory.competence))
      setValueDisplay(formatCurrency(priceHistory.value))
    } else {
      // Define valores iniciais quando não está editando
      const currentCompetence = getCurrentCompetence()
      form.setValue('competence', currentCompetence)
      setCompetenceDisplay(competenceStorageToDisplay(currentCompetence))
    }
  }, [priceHistory, therapyId, form])

  async function onSubmit(values: TherapyPriceHistoryFormValues) {
    try {
      if (isEditing && priceHistory) {
        await updateMutation.mutateAsync({
          id: priceHistory.id,
          data: {
            competence: values.competence,
            value: values.value,
          },
        })
      } else {
        await createMutation.mutateAsync(values)
      }

      form.reset({ therapyId, competence: '', value: 0 })
      setCompetenceDisplay('')
      setValueDisplay('')
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar valor da terapia:', error)
    }
  }

  const handleCompetenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCompetenceDisplay(e.target.value)
    setCompetenceDisplay(formatted)

    // Valida e converte para o formato de armazenamento
    const numbers = formatted.replace(/\D/g, '')
    if (numbers.length === 6) {
      const month = parseInt(numbers.slice(0, 2))
      const year = parseInt(numbers.slice(2, 6))

      // Valida mês (01-12) e ano (2020-ano atual)
      const currentYear = new Date().getFullYear()
      if (month >= 1 && month <= 12 && year >= 2020 && year <= currentYear) {
        const storageFormat = competenceDisplayToStorage(formatted)
        form.setValue('competence', storageFormat, { shouldValidate: true })
      } else {
        form.setValue('competence', '', { shouldValidate: true })
      }
    } else {
      form.setValue('competence', '', { shouldValidate: true })
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Remove tudo exceto números
    const numbers = input.replace(/\D/g, '')

    // Formata automaticamente enquanto digita
    const formatted = formatCurrencyInput(numbers)
    setValueDisplay(formatted)

    // Converte para número (centavos / 100)
    const numericValue = parseInt(numbers || '0') / 100
    form.setValue('value', numericValue, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="competence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Competência (Mês/Ano)</FormLabel>
              <FormControl>
                <Input
                  placeholder="MM/AAAA"
                  value={competenceDisplay}
                  onChange={handleCompetenceChange}
                  disabled={isLoading || isEditing}
                  maxLength={7}
                />
              </FormControl>
              <FormDescription>
                {isEditing ? 'A competência não pode ser alterada ao editar' : 'Digite o mês e ano (ex: 01/2024)'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input placeholder="R$ 0,00" value={valueDisplay} onChange={handleValueChange} disabled={isLoading} />
              </FormControl>
              <FormDescription>Digite o valor da terapia em reais</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Adicionar'} Valor
          </Button>
        </div>
      </form>
    </Form>
  )
}
