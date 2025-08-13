'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Cloud, Eye, FileText, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TimePickerSelector } from '@/components/ui/time-picker'

import { useCompanies } from '@/hooks/use-companies'
import { useGoogleDriveConfigStatus } from '@/hooks/use-google-drive-config'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'
import { usePatients } from '@/hooks/use-patients'
import { useProfessionals } from '@/hooks/use-professionals'
import {
  useCheckExistingFiles,
  useGenerateDriveSpreadsheet,
  useGenerateSpreadsheet,
  type CheckExistingFilesResponse,
  type GenerateDriveSpreadsheetResponse,
  type TransformedFormData,
} from '@/hooks/use-spreadsheet-mutations'
import { useTherapies } from '@/hooks/use-therapies'

import { formatDateISO, getFirstDayOfMonth, getLastDayOfMonth, getNowInBrazil } from '@/lib/date-utils'
import { spreadsheetFormSchema, WeekDays, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

import { CompanySelector } from './company-selector'
import { GuardianSelector } from './guardian-selector'
import { HealthPlanSelector } from './health-plan-selector'
import { PatientSelector } from './patient-selector'
import { ProfessionalSelector } from './professional-selector'
import { SpreadsheetPreview } from './spreadsheet-preview'
import { TherapySelector } from './therapy-selector'
import { Separator } from './ui/separator'
import { WeekdaySessionSelector } from './weekday-session-selector'

interface ExistingFilesInfo {
  existingFiles: CheckExistingFilesResponse['existingFiles']
  formData: SpreadsheetFormValues
}

export function SpreadsheetForm() {
  const [showPreview, setShowPreview] = useState(false)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [existingFilesInfo, setExistingFilesInfo] = useState<ExistingFilesInfo | null>(null)
  const [driveGenerationResult, setDriveGenerationResult] = useState<GenerateDriveSpreadsheetResponse | null>(null)

  // Estado local para os horários globais (não fazem parte do formulário)
  const [globalStartTime, setGlobalStartTime] = useState('')
  const [globalEndTime, setGlobalEndTime] = useState('')

  // Ref para o card de resultado do Google Drive
  const driveResultRef = useRef<HTMLDivElement>(null)

  // Hooks para buscar dados das entidades
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: companies } = useCompanies()
  const { data: healthPlans } = useHealthPlans()
  const { data: therapies } = useTherapies()

  // Hooks para Google Drive
  const { data: driveStatus } = useGoogleDriveConfigStatus()

  // Mutations
  const generateSpreadsheet = useGenerateSpreadsheet()
  const generateDriveSpreadsheet = useGenerateDriveSpreadsheet()
  const checkExistingFiles = useCheckExistingFiles()

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
    mode: 'onChange',
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      professionalId: '',
      licenseNumber: '',
      authorizedSession: '',
      patientId: '',
      guardianId: '',
      companyId: '',
      healthPlanId: '',
      therapyId: '',
      cardNumber: '',
      guideNumber: '',
      weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4, startTime: '08:00', endTime: '17:00' }],
      startDate: formatDateISO(firstDayOfMonth),
      endDate: formatDateISO(lastDayOfMonth),
    },
  })

  // Watch form values para preview e validação
  const formValues = form.watch()
  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')

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

  // Função para transformar dados do formulário para API
  function transformFormDataToApi(values: SpreadsheetFormValues): TransformedFormData {
    const professional = professionals?.find(p => p.id === values.professionalId)
    const patient = patients?.find(p => p.id === values.patientId)
    const guardian = guardians?.find(g => g.id === values.guardianId)
    const company = companies?.find(c => c.id === values.companyId)
    const healthPlan = healthPlans?.find(h => h.id === values.healthPlanId)
    const therapy = therapies?.find(t => t.id === values.therapyId)

    // Calcular horário mais cedo e mais tarde dos dias selecionados
    let earliestTime = '23:59'
    let latestTime = '00:00'

    values.weekDaySessions.forEach(session => {
      if (session.startTime < earliestTime) {
        earliestTime = session.startTime
      }
      if (session.endTime > latestTime) {
        latestTime = session.endTime
      }
    })

    return {
      professional: professional?.name || '',
      licenseNumber: values.licenseNumber,
      authorizedSession: values.authorizedSession || undefined,
      patientName: patient?.name || '',
      responsible: guardian?.name || '',
      healthPlan: healthPlan?.name || '',
      therapy: therapy?.name || '',
      cardNumber: values.cardNumber || undefined,
      guideNumber: values.guideNumber || undefined,
      company: company?.name || '',
      companyData: company ? {
        name: company.name,
        cnpj: company.cnpj,
        address: company.address
      } : undefined,
      weekDaySessions: values.weekDaySessions,
      startDate: values.startDate,
      endDate: values.endDate,
      startTime: earliestTime,
      endTime: latestTime,
    }
  }

  function applyGlobalTimes() {
    if (!globalStartTime || !globalEndTime) {
      toast.error('Preencha ambos os horários globais (início e fim) antes de aplicar')
      return
    }

    // Validar se horário fim é posterior ao início
    const [startHour, startMinute] = globalStartTime.split(':').map(Number)
    const [endHour, endMinute] = globalEndTime.split(':').map(Number)
    const startTimeInMinutes = startHour * 60 + startMinute
    const endTimeInMinutes = endHour * 60 + endMinute

    if (startTimeInMinutes >= endTimeInMinutes) {
      toast.error('Horário fim deve ser posterior ao horário de início')
      return
    }

    const currentWeekDaySessions = form.getValues('weekDaySessions')

    if (currentWeekDaySessions.length === 0) {
      toast.error('Selecione pelo menos um dia da semana antes de aplicar os horários')
      return
    }

    // Aplicar os horários globais a todos os dias selecionados
    const updatedWeekDaySessions = currentWeekDaySessions.map(session => ({
      ...session,
      startTime: globalStartTime,
      endTime: globalEndTime,
    }))

    form.setValue('weekDaySessions', updatedWeekDaySessions)
    toast.success(`Horários aplicados a ${currentWeekDaySessions.length} dia(s) selecionado(s)`)
  }

  async function handlePreview() {
    const isFormValid = await form.trigger()
    if (isFormValid) {
      setShowPreview(true)
    }
  }

  function handleSubmit(values: SpreadsheetFormValues) {
    const transformedData = transformFormDataToApi(values)
    generateSpreadsheet.mutate(transformedData)
  }

  async function handleGenerateDriveWithCheck(values: SpreadsheetFormValues) {
    // Limpar resultado anterior
    setDriveGenerationResult(null)

    const patient = patients?.find(p => p.id === values.patientId)

    if (!patient) {
      form.setError('patientId', { message: 'Paciente não encontrado' })
      return
    }

    // Verificar se existem arquivos no Google Drive
    try {
      const result = await checkExistingFiles.mutateAsync({
        patientName: patient.name,
        startDate: values.startDate,
        endDate: values.endDate,
      })

      if (result.hasExistingFiles) {
        // Mostrar dialog de confirmação
        setExistingFilesInfo({
          existingFiles: result.existingFiles,
          formData: values,
        })
        setShowOverwriteDialog(true)
      } else {
        // Gerar diretamente se não há arquivos existentes
        const transformedData = transformFormDataToApi(values)
        generateDriveSpreadsheet.mutate(transformedData, {
          onSuccess: result => {
            setDriveGenerationResult(result)
          },
        })
      }
    } catch (error) {
      // Se houver erro na verificação, continuar com geração normal
      const transformedData = transformFormDataToApi(values)
      generateDriveSpreadsheet.mutate(transformedData, {
        onSuccess: result => {
          setDriveGenerationResult(result)
        },
      })
      toast.error(error instanceof Error ? error.message : 'Erro ao verificar arquivos existentes')
    }
  }

  function handleConfirmOverwrite() {
    if (!existingFilesInfo) return

    const transformedData = transformFormDataToApi(existingFilesInfo.formData)
    generateDriveSpreadsheet.mutate(transformedData, {
      onSuccess: result => {
        setDriveGenerationResult(result)
      },
    })

    setShowOverwriteDialog(false)
    setExistingFilesInfo(null)
  }

  function handleCancelOverwrite() {
    setShowOverwriteDialog(false)
    setExistingFilesInfo(null)
  }

  // Estados de loading e error
  const isLoading = generateSpreadsheet.isPending || generateDriveSpreadsheet.isPending
  const isCheckingFiles = checkExistingFiles.isPending
  const error = generateSpreadsheet.error || generateDriveSpreadsheet.error || checkExistingFiles.error

  // Scroll automático para o card de resultado quando ele aparecer
  useEffect(() => {
    if (driveGenerationResult && driveResultRef.current) {
      // Delay pequeno para garantir que o DOM foi atualizado
      setTimeout(() => {
        if (driveResultRef.current) {
          driveResultRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
        }
      }, 100)
    }
  }, [driveGenerationResult])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preencha os dados para gerar a planilha de atendimento baseada no template.</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Todos os campos em um grid único para preenchimento 100% das linhas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <CompanySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione uma empresa..."
                        showValidationIcon
                        error={form.formState.errors.companyId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Profissional</FormLabel>
                    <FormControl>
                      <ProfessionalSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um profissional..."
                        showValidationIcon
                        error={form.formState.errors.professionalId}
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
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Nº conselho</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nº conselho do profissional"
                        {...field}
                        showValidationIcon
                        error={form.formState.errors.licenseNumber}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorizedSession"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Sessão autorizada (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tipo de sessão autorizada"
                        {...field}
                        showValidationIcon
                        error={form.formState.errors.authorizedSession}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Paciente</FormLabel>
                    <FormControl>
                      <PatientSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um paciente..."
                        showValidationIcon
                        error={form.formState.errors.patientId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 xl:col-span-2">
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <GuardianSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um responsável..."
                        showValidationIcon
                        error={form.formState.errors.guardianId}
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
                  <FormItem className="sm:col-span-1 xl:col-span-2">
                    <FormLabel>Plano de saúde</FormLabel>
                    <FormControl>
                      <HealthPlanSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um plano de saúde..."
                        showValidationIcon
                        error={form.formState.errors.healthPlanId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="therapyId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 xl:col-span-2">
                    <FormLabel>Terapia</FormLabel>
                    <FormControl>
                      <TherapySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione uma terapia..."
                        showValidationIcon
                        error={form.formState.errors.therapyId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 xl:col-span-2">
                    <FormLabel>Nº carteirinha (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nº da carteirinha"
                        {...field}
                        showValidationIcon
                        error={form.formState.errors.cardNumber}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guideNumber"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 xl:col-span-2">
                    <FormLabel>Guia Nº (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nº da guia"
                        {...field}
                        showValidationIcon
                        error={form.formState.errors.guideNumber}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Data de início</FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={date => {
                          const newStartDate = date ? formatDateToLocal(date) : ''
                          field.onChange(newStartDate)

                          // Se a data fim já estiver selecionada e for anterior ou igual à nova data início,
                          // limpa a data fim para forçar o usuário a selecionar uma nova
                          const currentEndDate = form.getValues('endDate')
                          if (currentEndDate && date && new Date(currentEndDate + 'T00:00:00') <= date) {
                            form.setValue('endDate', '')
                          }
                        }}
                        placeholder="Selecione a data de início"
                        format="dd/MM/yyyy"
                        showValidationIcon
                        error={form.formState.errors.startDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Data fim</FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={date => field.onChange(date ? formatDateToLocal(date) : '')}
                        placeholder="Selecione a data fim"
                        fromDate={getMinEndDate(startDate)}
                        format="dd/MM/yyyy"
                        showValidationIcon
                        error={form.formState.errors.endDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Dias da semana e sessões */}
            <FormField
              control={form.control}
              name="weekDaySessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-center sm:flex sm:justify-center">
                    Dias da semana, sessões e horários
                  </FormLabel>
                  <FormDescription className="text-center text-xs sm:text-sm">
                    Selecione os dias de atendimento, configure a quantidade de sessões e os horários por dia
                  </FormDescription>
                  <FormControl>
                    <div className="mx-auto w-auto max-w-4xl">
                      <WeekdaySessionSelector value={field.value} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horários globais - aplicar a todos os dias */}
            <div className="bg-muted/30 rounded-lg border p-3">
              <div className="mb-3 text-center">
                <h3 className="text-sm font-medium">Aplicar horário a todos os dias</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Configure um horário para aplicar automaticamente a todos os dias selecionados
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium whitespace-nowrap">Início:</label>
                  <TimePickerSelector
                    value={globalStartTime}
                    onChange={setGlobalStartTime}
                    placeholder="--:--"
                    className="w-24"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium whitespace-nowrap">Fim:</label>
                  <TimePickerSelector
                    value={globalEndTime}
                    onChange={setGlobalEndTime}
                    placeholder="--:--"
                    className="w-24"
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={applyGlobalTimes}
                  className="shrink-0 sm:ml-2">
                  Aplicar a todos
                </Button>
              </div>
            </div>

            {/* Mensagens de erro */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            {/* Aviso sobre múltiplos meses */}
            {isMultipleMonths && (
              <Alert>
                <AlertDescription>
                  <strong>Múltiplos meses detectados:</strong> Será gerado um arquivo ZIP contendo uma planilha completa
                  para cada mês no período selecionado (cada planilha conterá todas as datas do respectivo mês).
                </AlertDescription>
              </Alert>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={handlePreview}
                disabled={isLoading || isCheckingFiles}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                <span className="hidden sm:inline">Visualizar Preview</span>
                <span className="sm:hidden">Preview</span>
              </Button>

              <Button type="submit" className="w-full sm:flex-1" disabled={isLoading || isCheckingFiles}>
                {generateSpreadsheet.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {generateSpreadsheet.isPending
                    ? isMultipleMonths
                      ? 'Gerando planilhas...'
                      : 'Gerando planilha...'
                    : isMultipleMonths
                      ? 'Gerar planilhas (ZIP)'
                      : 'Gerar planilha'}
                </span>
                <span className="sm:hidden">
                  {generateSpreadsheet.isPending ? 'Gerando...' : isMultipleMonths ? 'Gerar ZIP' : 'Gerar'}
                </span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full sm:flex-1"
                onClick={async () => {
                  const isFormValid = await form.trigger()
                  if (isFormValid) {
                    handleGenerateDriveWithCheck(form.getValues())
                  }
                }}
                disabled={isLoading || isCheckingFiles || !driveStatus?.isConfigured}
                title={
                  !driveStatus?.isConfigured
                    ? 'Configure o Google Drive primeiro nas configurações'
                    : 'Gerar planilhas organizadas por mês no Google Drive'
                }>
                {isCheckingFiles || generateDriveSpreadsheet.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isCheckingFiles
                    ? 'Verificando arquivos...'
                    : generateDriveSpreadsheet.isPending
                      ? 'Gerando no Drive...'
                      : 'Gerar no Google Drive'}
                </span>
                <span className="sm:hidden">
                  {isCheckingFiles ? 'Verificando...' : generateDriveSpreadsheet.isPending ? 'Drive...' : 'Drive'}
                </span>
              </Button>
            </div>
          </form>
        </Form>

        {/* Resultado da geração no Google Drive */}
        {driveGenerationResult && (
          <div ref={driveResultRef} className="mt-6">
            <Alert className="border-green-200 bg-green-50">
              <Cloud className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium text-green-800">{driveGenerationResult.message}</p>

                  {driveGenerationResult.files.length === 1 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700">Arquivo gerado:</p>
                      <a
                        href={`https://drive.google.com/file/d/${driveGenerationResult.files[0].id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 underline hover:text-blue-800">
                        <FileText className="h-4 w-4" />
                        {driveGenerationResult.files[0].name}
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700">
                        {driveGenerationResult.files.length} arquivos gerados na pasta do paciente:
                      </p>
                      <div className="space-y-1">
                        {driveGenerationResult.files.map((file, index) => (
                          <a
                            key={index}
                            href={`https://drive.google.com/file/d/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mr-4 inline-flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800">
                            <FileText className="h-4 w-4" />
                            {file.name}
                          </a>
                        ))}
                      </div>
                      <div className="pt-2">
                        <a
                          href={`https://drive.google.com/drive/search?q=${encodeURIComponent(driveGenerationResult.patientFolder)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-800">
                          <Cloud className="h-4 w-4" />
                          Ver pasta do paciente no Google Drive
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setDriveGenerationResult(null)}
                    className="text-xs text-gray-500 underline hover:text-gray-700">
                    Fechar
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="mt-6">
            <SpreadsheetPreview formData={formValues} onClose={() => setShowPreview(false)} />
          </div>
        )}

        {/* Dialog de confirmação para sobrescrever arquivos */}
        <AlertDialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivos Existentes Encontrados</AlertDialogTitle>
              <AlertDialogDescription>
                Foram encontrados arquivos existentes no Google Drive para este paciente no período selecionado:
                <div className="mt-3 space-y-2">
                  {existingFilesInfo?.existingFiles.map((file, index) => (
                    <div key={index} className="border-primary/80 rounded border p-2">
                      <span className="text-sm font-medium">{file.name}</span>
                      <div className="text-xs text-gray-600">
                        Última modificação:{' '}
                        {new Date(file.modifiedTime).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm">
                  Deseja continuar e sobrescrever os arquivos existentes? Esta ação não pode ser desfeita.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelOverwrite}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmOverwrite} className="bg-orange-600 hover:bg-orange-700">
                Sim, Sobrescrever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
