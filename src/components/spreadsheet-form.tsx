'use client'

import { Calendar, Cloud, Eye, FileText, Loader2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
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
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCompanies } from '@/hooks/use-companies'
import { useGoogleDriveConfigStatus } from '@/hooks/use-google-drive-config'
import { useHealthPlans } from '@/hooks/use-health-plans'
import { usePatients } from '@/hooks/use-patients'
import { useProfessionals } from '@/hooks/use-professionals'
import { useGlobalTimeHandler, usePatientHandler, useProfessionalHandler } from '@/hooks/use-spreadsheet-form-handlers'
import { useFormLoadingStates, useSpreadsheetFormSetup } from '@/hooks/use-spreadsheet-form-setup'
import {
  useCheckExistingFiles,
  useGenerateDriveSpreadsheet,
  useGenerateSpreadsheet,
  type CheckExistingFilesResponse,
  type GenerateDriveSpreadsheetResponse,
} from '@/hooks/use-spreadsheet-mutations'
import { useTherapies } from '@/hooks/use-therapies'

import { createComboBoxOptions } from '@/lib/combobox-helpers'
import { formatDateToLocal, getMinEndDate, isMultipleMonths } from '@/lib/date-utils'
import { transformFormDataToApi } from '@/lib/form-transformers'
import { scrollToElement } from '@/lib/scroll-utils'
import type { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

import { SpreadsheetCalendar } from './spreadsheet-calendar'
import { SpreadsheetPreview } from './spreadsheet-preview'
import { Combobox } from './ui/combobox'
import { Separator } from './ui/separator'
import { WeekdaySessionSelector } from './weekday-session-selector'

interface ExistingFilesInfo {
  existingFiles: CheckExistingFilesResponse['existingFiles']
  formData: SpreadsheetFormValues
}

export function SpreadsheetForm() {
  const [showPreview, setShowPreview] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [existingFilesInfo, setExistingFilesInfo] = useState<ExistingFilesInfo | null>(null)
  const [driveGenerationResult, setDriveGenerationResult] = useState<GenerateDriveSpreadsheetResponse | null>(null)

  // Estado local para os horários globais (não fazem parte do formulário)
  const [globalStartTime, setGlobalStartTime] = useState('')
  const [globalEndTime, setGlobalEndTime] = useState('')

  // Ref para o card do calendário
  const calendarRef = useRef<HTMLDivElement>(null)

  // Hooks para buscar dados das entidades
  const { data: professionals } = useProfessionals()
  const { data: patients } = usePatients()
  const { data: companies } = useCompanies()
  const { data: healthPlans } = useHealthPlans()
  const { data: therapies } = useTherapies()

  // Hooks para Google Drive
  const { data: driveStatus } = useGoogleDriveConfigStatus()

  // Mutations
  const generateSpreadsheet = useGenerateSpreadsheet()
  const generateDriveSpreadsheet = useGenerateDriveSpreadsheet()
  const checkExistingFiles = useCheckExistingFiles()

  // Setup do formulário
  const { form } = useSpreadsheetFormSetup()

  // Estados de loading e error
  const { isLoading, isCheckingFiles, error } = useFormLoadingStates(
    generateSpreadsheet,
    generateDriveSpreadsheet,
    checkExistingFiles,
  )

  // Watch form values para preview e validação
  const formValues = form.watch()
  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')
  const dateOverrides = (form.watch('dateOverrides') ?? []) as SpreadsheetFormValues['dateOverrides']

  // Verificar se o período abrange múltiplos meses
  const isMultipleMonthsPeriod = isMultipleMonths(startDate, endDate)

  // Hooks para handlers de formulário
  const { handleProfessionalChange } = useProfessionalHandler(form, professionals)
  const { handlePatientChange } = usePatientHandler(form, patients)
  const { applyGlobalTimes } = useGlobalTimeHandler(form)

  const handleDateOverridesChange = (value: SpreadsheetFormValues['dateOverrides']) => {
    form.setValue('dateOverrides', value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  function formatTimeInput(value: string): string {
    const numbersOnly = value.replace(/\D/g, '')

    if (numbersOnly.length === 0) return ''
    if (numbersOnly.length <= 2) return numbersOnly

    return `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2, 4)}`
  }

  function handleTimeInputChange(value: string, type: 'start' | 'end') {
    const formatted = formatTimeInput(value)

    if (formatted.length === 5) {
      const [hours, minutes] = formatted.split(':').map(Number)

      if (hours > 23 || minutes > 59) {
        return
      }
    }

    if (type === 'start') {
      setGlobalStartTime(formatted)
    } else {
      setGlobalEndTime(formatted)
    }
  }

  async function handleShowCalendar() {
    const isFormValid = await form.trigger()
    if (isFormValid) {
      setShowCalendar(true)
      scrollToElement(calendarRef)
    }
  }

  function handleSubmit(values: SpreadsheetFormValues) {
    const transformedData = transformFormDataToApi(values, {
      professionals,
      patients,
      companies,
      healthPlans,
      therapies,
    })
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
        const transformedData = transformFormDataToApi(values, {
          professionals,
          patients,
          companies,
          healthPlans,
          therapies,
        })
        generateDriveSpreadsheet.mutate(transformedData, {
          onSuccess: result => {
            setDriveGenerationResult(result)
          },
        })
      }
    } catch (error) {
      // Se houver erro na verificação, continuar com geração normal
      const transformedData = transformFormDataToApi(values, {
        professionals,
        patients,
        companies,
        healthPlans,
        therapies,
      })
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

    const transformedData = transformFormDataToApi(existingFilesInfo.formData, {
      professionals,
      patients,
      companies,
      healthPlans,
      therapies,
    })
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

  return (
    <React.Fragment>
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
                    <Combobox
                      options={createComboBoxOptions(companies, entity => ({
                        value: entity.id,
                        label: entity.name,
                      }))}
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
                    <Combobox
                      options={createComboBoxOptions(professionals, entity => ({
                        value: entity.id,
                        label: entity.name,
                      }))}
                      value={field.value}
                      onValueChange={handleProfessionalChange}
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
              name="therapyId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 xl:col-span-2">
                  <FormLabel>Terapia</FormLabel>
                  <FormControl>
                    <Combobox
                      options={createComboBoxOptions(therapies, entity => ({
                        value: entity.id,
                        label: entity.name,
                      }))}
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
                    <Combobox
                      options={createComboBoxOptions(patients, entity => ({
                        value: entity.id,
                        label: entity.name,
                      }))}
                      value={field.value}
                      onValueChange={handlePatientChange}
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
              name="guardian"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 xl:col-span-2">
                  <FormLabel>Responsável</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do responsável"
                      {...field}
                      showValidationIcon
                      error={form.formState.errors.guardian}
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
                <FormItem className="sm:col-span-2 xl:col-span-2">
                  <FormLabel>Plano de saúde</FormLabel>
                  <FormControl>
                    <Combobox
                      options={createComboBoxOptions(healthPlans, entity => ({
                        value: entity.id,
                        label: entity.name,
                      }))}
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
              name="cardNumber"
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2 xl:col-span-2">
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
                <FormItem className="col-span-1 sm:col-span-2 xl:col-span-2">
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
                <FormItem className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1">
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
                <FormItem className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1">
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
                  Selecione os dias de atendimento, configure a quantidade de sessões e opcionalmente os horários por
                  dia
                </FormDescription>
                <FormControl>
                  <WeekdaySessionSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          {/* Horários globais - aplicar a todos os dias */}
          <div className="bg-muted/30 rounded-lg border p-3">
            <div className="mb-3 text-center">
              <h3 className="text-sm font-medium">Aplicar horário a todos os dias (opcional)</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Informe um horário para aplicar a todos os dias selecionados
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-center sm:justify-center md:flex-row">
              <div className="flex flex-row items-center justify-center gap-3 sm:flex-row">
                <div className="flex flex-col items-center gap-2 md:flex-row">
                  <label className="text-xs font-medium whitespace-nowrap">Horário:</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={globalStartTime || ''}
                      onChange={e => handleTimeInputChange(e.target.value, 'start')}
                      placeholder="00:00"
                      maxLength={5}
                      className="h-7 w-16 text-center text-xs"
                    />
                    <span>-</span>
                    <Input
                      type="text"
                      value={globalEndTime || ''}
                      onChange={e => handleTimeInputChange(e.target.value, 'end')}
                      placeholder="00:00"
                      maxLength={5}
                      className="h-7 w-16 text-center text-xs"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyGlobalTimes(globalStartTime, globalEndTime)}
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
          {isMultipleMonthsPeriod && (
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
              onClick={handleShowCalendar}
              disabled={isLoading || isCheckingFiles}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              <span className="hidden sm:inline">Ver Calendário</span>
              <span className="sm:hidden">Calendário</span>
            </Button>

            <Button type="submit" className="sm:flex-1" disabled={isLoading || isCheckingFiles}>
              {generateSpreadsheet.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {generateSpreadsheet.isPending
                  ? isMultipleMonthsPeriod
                    ? 'Gerando planilhas...'
                    : 'Gerando planilha...'
                  : isMultipleMonthsPeriod
                    ? 'Gerar planilhas (ZIP)'
                    : 'Gerar planilha'}
              </span>
              <span className="sm:hidden">
                {generateSpreadsheet.isPending ? 'Gerando...' : isMultipleMonthsPeriod ? 'Gerar ZIP' : 'Gerar'}
              </span>
            </Button>
          </div>
        </form>
      </Form>

      {/* Calendar */}
      {showCalendar && (
        <div ref={calendarRef} className="mt-6">
          <SpreadsheetCalendar
            formData={formValues}
            dateOverrides={dateOverrides}
            onChangeOverrides={handleDateOverridesChange}
            onClose={() => setShowCalendar(false)}
          />
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
    </React.Fragment>
  )
}
