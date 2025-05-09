'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { WeekDays, meses, spreadsheetFormSchema, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'
import { WeekdaySelector } from './weekdays-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SpreadsheetForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Obter o ano atual para as opções de ano
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 3 }, (_, i) => (anoAtual + i).toString())

  const form = useForm<SpreadsheetFormValues>({
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      professional: '',
      licenseNumber: '',
      authorizedSession: '',
      patientName: '',
      responsible: '',
      healthPlan: '',
      weekDays: [WeekDays.MONDAY],
      competencia: {
        mes: new Date().getMonth().toString(),
        ano: anoAtual.toString()
      }
    },
  })

  async function handleSubmit(values: SpreadsheetFormValues) {
    try {
      setIsGenerating(true)
      setError(null)

      // Make API request
      const response = await fetch('/api/generate-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generating spreadsheet')
      }

      // Get blob from response
      const blob = await response.blob()

      // Create download link and click it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance-sheet.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Gerador de Planilha de Atendimento</CardTitle>
        <CardDescription>
          Preencha os dados para gerar a planilha de atendimento baseada no template.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="professional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Profissional</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº conselho</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº conselho do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="authorizedSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sessão autorizada</FormLabel>
                    <FormControl>
                      <Input placeholder="Tipo de sessão autorizada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de saúde</FormLabel>
                    <FormControl>
                      <Input placeholder="Plano de saúde" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="competencia.mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês de competência</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent className='w-full'>
                          {meses.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>
                              {mes.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competencia.ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de competência</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent className='w-full'>
                          {anos.map((ano) => (
                            <SelectItem key={ano} value={ano}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="weekDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias da semana</FormLabel>
                  <FormDescription>
                    Selecione os dias de atendimento da semana
                  </FormDescription>
                  <FormControl>
                    <WeekdaySelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? 'Gerando planilha...' : 'Gerar planilha'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
