'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useGenerateDriveSpreadsheet } from '@/hooks/use-generate-drive-spreadsheet'
import { useGoogleDriveConfigStatus } from '@/hooks/use-google-drive-config'
import { getNowInBrazil, getFirstDayOfMonth, getLastDayOfMonth, formatDateISO } from '@/lib/date-utils'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'
import { usePatients } from '@/hooks/use-patients'
import { useProfessionals } from '@/hooks/use-professionals'
import { WeekDays, spreadsheetFormSchema, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'
import { Cloud, Eye, FileText } from 'lucide-react'
import { GuardianSelector } from './guardian-selector'
import { HealthPlanSelector } from './health-plan-selector'
import { PatientSelector } from './patient-selector'
import { ProfessionalSelector } from './professional-selector'
import { SpreadsheetPreview } from './spreadsheet-preview'
import { WeekdaySessionSelector } from './weekday-session-selector'

export function SpreadsheetForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Hooks para buscar dados das entidades
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

  // Hooks para Google Drive
  const { data: driveStatus } = useGoogleDriveConfigStatus()
  const generateDriveSpreadsheet = useGenerateDriveSpreadsheet()

  // Helper para converter Date para string local (YYYY-MM-DD)
  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Obter datas atuais para valores padrão
  const today = getNowInBrazil()
  const firstDayOfMonth = getFirstDayOfMonth(today.getFullYear(), today.getMonth())
  const lastDayOfMonth = getLastDayOfMonth(today.getFullYear(), today.getMonth())

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
      dataInicio: formatDateISO(firstDayOfMonth),
      dataFim: formatDateISO(lastDayOfMonth),
    },
  })

  // Watch form values for real-time preview updates
  const formValues = form.watch()

  // Watch data início para validação da data fim
  const startDate = form.watch('dataInicio')
  const endDate = form.watch('dataFim')

  // Verificar se o período abrange múltiplos meses
  const isMultipleMonths = (() => {
    if (!startDate || !endDate) return false
    const startDateObj = new Date(startDate + 'T00:00:00')
    const endDateObj = new Date(endDate + 'T00:00:00')
    return startDateObj.getMonth() !== endDateObj.getMonth() || startDateObj.getFullYear() !== endDateObj.getFullYear()
  })()

  // Helper para obter o dia seguinte à data de início
  const getMinEndDate = (startDate: string | undefined) => {
    if (!startDate) return undefined
    const date = new Date(startDate + 'T00:00:00')
    date.setDate(date.getDate() + 1)
    return date
  }

  async function handlePreview() {
    const isFormValid = await form.trigger()
    if (isFormValid) {
      setShowPreview(true)
      setError(null)
    }
  }

  // Função para transformar dados do formulário para API
  function transformFormDataToApi(values: SpreadsheetFormValues) {
    const professional = professionals?.find(p => p.id === values.professionalId)
    const patient = patients?.find(p => p.id === values.patientId)
    const guardian = guardians?.find(g => g.id === values.guardianId)
    const healthPlan = healthPlans?.find(h => h.id === values.healthPlanId)

    return {
      professional: professional?.name || '',
      licenseNumber: values.licenseNumber,
      authorizedSession: values.authorizedSession,
      patientName: patient?.name || '',
      responsible: guardian?.name || '',
      healthPlan: healthPlan?.name || '',
      weekDaySessions: values.weekDaySessions,
      dataInicio: values.dataInicio,
      dataFim: values.dataFim,
    }
  }

  async function handleSubmit(values: SpreadsheetFormValues) {
    try {
      setIsGenerating(true)
      setError(null)

      const transformedData = transformFormDataToApi(values)

      // Verificar se o período abrange mais de um mês
      const startDateObj = new Date(values.dataInicio + 'T00:00:00')
      const endDateObj = new Date(values.dataFim + 'T00:00:00')
      const isMultiMonth =
        startDateObj.getMonth() !== endDateObj.getMonth() || startDateObj.getFullYear() !== endDateObj.getFullYear()

      // Usar a API apropriada baseada no período
      const apiEndpoint = isMultiMonth ? '/api/generate-spreadsheet-multi' : '/api/generate-spreadsheet'

      // Make API request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generating spreadsheet')
      }

      // Get blob from response
      const blob = await response.blob()

      // Create download link and click it
      const downloadUrl = window.URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl

      // Definir nome do arquivo baseado no tipo
      const fileName = isMultiMonth ? 'attendance-sheets.zip' : 'attendance-sheet.xlsx'
      downloadLink.download = fileName

      document.body.appendChild(downloadLink)
      downloadLink.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(downloadLink)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateDrive(values: SpreadsheetFormValues) {
    const transformedData = transformFormDataToApi(values)
    generateDriveSpreadsheet.mutate(transformedData)
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
                name="dataInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={date => {
                          const newStartDate = date ? formatDateToLocal(date) : ''
                          field.onChange(newStartDate)

                          // Se a data fim já estiver selecionada e for anterior ou igual à nova data início,
                          // limpa a data fim para forçar o usuário a selecionar uma nova
                          const currentEndDate = form.getValues('dataFim')
                          if (currentEndDate && date && new Date(currentEndDate + 'T00:00:00') <= date) {
                            form.setValue('dataFim', '')
                          }
                        }}
                        placeholder="Selecione a data de início"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataFim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data fim</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={date => field.onChange(date ? formatDateToLocal(date) : '')}
                        placeholder="Selecione a data fim"
                        className="w-full"
                        fromDate={getMinEndDate(startDate)}
                      />
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

            {isMultipleMonths && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                <p className="text-sm">
                  <strong>Múltiplos meses detectados:</strong> Será gerado um arquivo ZIP contendo uma planilha completa
                  para cada mês no período selecionado (cada planilha conterá todas as datas do respectivo mês).
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
                disabled={isGenerating || generateDriveSpreadsheet.isPending}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Preview
              </Button>

              <Button type="submit" className="flex-1" disabled={isGenerating || generateDriveSpreadsheet.isPending}>
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating
                  ? isMultipleMonths
                    ? 'Gerando planilhas...'
                    : 'Gerando planilha...'
                  : isMultipleMonths
                    ? 'Gerar planilhas (ZIP)'
                    : 'Gerar planilha'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  const isFormValid = await form.trigger()
                  if (isFormValid) {
                    handleGenerateDrive(form.getValues())
                  }
                }}
                disabled={isGenerating || generateDriveSpreadsheet.isPending || !driveStatus?.isConfigured}
                title={
                  !driveStatus?.isConfigured
                    ? 'Configure o Google Drive primeiro nas configurações'
                    : 'Gerar planilhas organizadas por mês no Google Drive'
                }>
                <Cloud className="mr-2 h-4 w-4" />
                {generateDriveSpreadsheet.isPending ? 'Gerando no Drive...' : 'Gerar no Google Drive'}
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
