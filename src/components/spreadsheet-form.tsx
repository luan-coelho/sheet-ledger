'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Cloud, Eye, FileText, Loader2 } from 'lucide-react'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'

import { useGoogleDriveConfigStatus } from '@/hooks/use-google-drive-config'
import { getNowInBrazil, getFirstDayOfMonth, getLastDayOfMonth, formatDateISO } from '@/lib/date-utils'
import { useGuardians } from '@/hooks/use-guardians'
import { useHealthPlans } from '@/hooks/use-health-plans'
import { usePatients } from '@/hooks/use-patients'
import { useProfessionals } from '@/hooks/use-professionals'
import { WeekDays, spreadsheetFormSchema, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

import {
  useGenerateSpreadsheet,
  useGenerateDriveSpreadsheet,
  useCheckExistingFiles,
  type TransformedFormData,
  type CheckExistingFilesResponse,
} from '@/hooks/use-spreadsheet-mutations'

import { GuardianSelector } from './guardian-selector'
import { HealthPlanSelector } from './health-plan-selector'
import { PatientSelector } from './patient-selector'
import { ProfessionalSelector } from './professional-selector'
import { SpreadsheetPreview } from './spreadsheet-preview'
import { WeekdaySessionSelector } from './weekday-session-selector'
import { Separator } from './ui/separator'
import { TimePickerDemo } from './ui/time-picker'
import { toast } from 'sonner'

interface ExistingFilesInfo {
  existingFiles: CheckExistingFilesResponse['existingFiles']
  formData: SpreadsheetFormValues
}

export function SpreadsheetForm() {
  const [showPreview, setShowPreview] = useState(false)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [existingFilesInfo, setExistingFilesInfo] = useState<ExistingFilesInfo | null>(null)

  // Hooks para buscar dados das entidades
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: guardians } = useGuardians()
  const { data: healthPlans } = useHealthPlans()

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
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      professionalId: '',
      licenseNumber: '',
      authorizedSession: '',
      patientId: '',
      guardianId: '',
      healthPlanId: '',
      weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4 }],
      startDate: formatDateISO(firstDayOfMonth),
      endDate: formatDateISO(lastDayOfMonth),
      startTime: '08:00',
      endTime: '17:00',
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
    const healthPlan = healthPlans?.find(h => h.id === values.healthPlanId)

    return {
      professional: professional?.name || '',
      licenseNumber: values.licenseNumber,
      authorizedSession: values.authorizedSession,
      patientName: patient?.name || '',
      responsible: guardian?.name || '',
      healthPlan: healthPlan?.name || '',
      weekDaySessions: values.weekDaySessions,
      startDate: values.startDate,
      endDate: values.endDate,
      startTime: values.startTime,
      endTime: values.endTime,
    }
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
        generateDriveSpreadsheet.mutate(transformedData)
      }
    } catch (error) {
      // Se houver erro na verificação, continuar com geração normal
      const transformedData = transformFormDataToApi(values)
      generateDriveSpreadsheet.mutate(transformedData)
      toast.error(error instanceof Error ? error.message : 'Erro ao verificar arquivos existentes')
    }
  }

  function handleConfirmOverwrite() {
    if (!existingFilesInfo) return

    const transformedData = transformFormDataToApi(existingFilesInfo.formData)
    generateDriveSpreadsheet.mutate(transformedData)

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerador de Planilha de Atendimento</CardTitle>
        <CardDescription>Preencha os dados para gerar a planilha de atendimento baseada no template.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Todos os campos em um grid único para preenchimento 100% das linhas */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>Data fim</FormLabel>
                    <FormControl>
                      <DatePicker
                        className="w-full"
                        date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={date => field.onChange(date ? formatDateToLocal(date) : '')}
                        placeholder="Selecione a data fim"
                        fromDate={getMinEndDate(startDate)}
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
                  <FormLabel className="text-center block sm:flex sm:justify-center">
                    Dias da semana e sessões
                  </FormLabel>
                  <FormDescription className="text-center text-xs sm:text-sm">
                    Selecione os dias de atendimento e configure a quantidade de sessões por dia
                  </FormDescription>
                  <FormControl>
                    <div className="w-full max-w-4xl mx-auto">
                      <WeekdaySessionSelector value={field.value} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horários de atendimento */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className="text-center">Horário início</FormLabel>
                      <FormControl>
                        <TimePickerDemo
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione horário início"
                          className="w-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className="text-center">Horário fim</FormLabel>
                      <FormControl>
                        <TimePickerDemo
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione horário fim"
                          className="w-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <div key={index} className="border border-primary/80 rounded p-2">
                      <span className="font-medium text-sm">{file.name}</span>
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
