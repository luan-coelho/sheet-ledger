'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { WeekDays, meses, spreadsheetFormSchema, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'
import { WeekdaySessionSelector } from './weekday-session-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfessionalSelector } from './professional-selector'
import { PatientSelector } from './patient-selector'
import { GuardianSelector } from './guardian-selector'
import { HealthPlanSelector } from './health-plan-selector'
import { SpreadsheetPreview } from './spreadsheet-preview'
import { Eye, FileText } from 'lucide-react'
import { useProfessionals } from '@/hooks/use-professionals'
import { usePatients } from '@/hooks/use-patients'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'

export function SpreadsheetForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Hooks para buscar dados das entidades
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

  // Obter o ano atual para as opções de ano
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 3 }, (_, i) => (anoAtual + i).toString())

  const form = useForm<SpreadsheetFormValues>({
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      professionalId: '',
      licenseNumber: '',
      authorizedSession: '',
      patientId: '',
      guardianId: '',
      healthPlanId: '',
      weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4 }],
      competencia: {
        mes: new Date().getMonth().toString(),
        ano: anoAtual.toString(),
      },
    },
  })

  // Watch form values for real-time preview updates
  const formValues = form.watch()

  async function handlePreview() {
    const isValid = await form.trigger()
    if (isValid) {
      setShowPreview(true)
      setError(null)
    }
  }

  async function handleSubmit(values: SpreadsheetFormValues) {
    try {
      setIsGenerating(true)
      setError(null)

      // Transform form data to API format
      const professional = professionals?.find(p => p.id === values.professionalId)
      const patient = patients?.find(p => p.id === values.patientId)
      const guardian = guardians?.find(g => g.id === values.guardianId)
      const healthPlan = healthPlans?.find(h => h.id === values.healthPlanId)

      const apiData = {
        professional: professional?.name || '',
        licenseNumber: values.licenseNumber,
        authorizedSession: values.authorizedSession,
        patientName: patient?.name || '',
        responsible: guardian?.name || '',
        healthPlan: healthPlan?.name || '',
        weekDaySessions: values.weekDaySessions,
        competencia: values.competencia,
      }

      // Make API request
      const response = await fetch('/api/generate-spreadsheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerador de Planilha de Atendimento</CardTitle>
        <CardDescription>Preencha os dados para gerar a planilha de atendimento baseada no template.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <FormControl>
                      <ProfessionalSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um profissional..."
                      />
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
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <FormControl>
                      <PatientSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um paciente..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="guardianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <GuardianSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um responsável..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthPlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de saúde</FormLabel>
                    <FormControl>
                      <HealthPlanSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um plano de saúde..."
                      />
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {meses.map(mes => (
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {anos.map(ano => (
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
              name="weekDaySessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias da semana e sessões</FormLabel>
                  <FormDescription>
                    Selecione os dias de atendimento e configure a quantidade de sessões por dia
                  </FormDescription>
                  <FormControl>
                    <WeekdaySessionSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
                disabled={isGenerating}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Preview
              </Button>

              <Button type="submit" className="flex-1" disabled={isGenerating}>
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? 'Gerando planilha...' : 'Gerar planilha'}
              </Button>
            </div>
          </form>
        </Form>

        {showPreview && (
          <div className="mt-6">
            <SpreadsheetPreview formData={formValues} onClose={() => setShowPreview(false)} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
