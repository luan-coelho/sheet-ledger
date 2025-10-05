'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import InputMask from 'react-input-mask'
import { z } from 'zod'

import { insertBillingSchema } from '@/app/db/schemas/billing-schema'

import { HealthPlanSelector } from '@/components/health-plan-selector'
import { MultipleTherapySelector } from '@/components/multiple-therapy-selector'
import { PatientSelector } from '@/components/patient-selector'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useTherapies } from '@/hooks/use-therapies'
import { useTherapyPricesByCompetence } from '@/hooks/use-therapy-price-by-competence'

import { centsToDecimal, decimalToCents } from '@/lib/billing-utils'

// Schema para sessão de terapia
const therapySessionSchema = z.object({
  therapyId: z.string().uuid(),
  therapyName: z.string(),
  sessionValue: z.number().min(0, 'Valor deve ser positivo'),
  sessionsCount: z.number().min(0, 'Número de sessões deve ser positivo').int(),
  totalValue: z.number().min(0),
})

// Schema principal do formulário
const billingFormSchema = z.object({
  patientId: z.string().uuid({ message: 'Paciente é obrigatório' }),
  competence: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Competência deve estar no formato MM/yyyy'),
  healthPlanId: z.string().optional().or(z.literal('')),
  selectedTherapyIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos uma terapia'),
  therapySessions: z.array(therapySessionSchema),
  dueDate: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data de vencimento deve estar no formato dd/MM/yyyy')
    .optional()
    .or(z.literal('')),
  invoiceIssuedAt: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data de emissão deve estar no formato dd/MM/yyyy')
    .optional()
    .or(z.literal('')),
  invoiceNumber: z.string().optional().or(z.literal('')),
  billerName: z.string().optional().or(z.literal('')),
  status: z.enum(['pending', 'scheduled', 'sent', 'paid', 'cancelled']),
  isBilled: z.boolean(),
  notes: z.string().optional().or(z.literal('')),
})

type BillingFormValues = z.infer<typeof billingFormSchema>

interface BillingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof insertBillingSchema>[]) => void | Promise<void>
  mode?: 'create'
}

export function BillingForm({ open, onOpenChange, onSubmit, mode = 'create' }: BillingFormProps) {
  const { data: therapies } = useTherapies()

  // Função para obter competência atual no formato MM/yyyy
  function getCurrentCompetence() {
    const now = new Date()
    return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  }

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patientId: '',
      competence: getCurrentCompetence(),
      healthPlanId: '',
      selectedTherapyIds: [],
      therapySessions: [],

      dueDate: undefined,
      invoiceIssuedAt: undefined,
      invoiceNumber: '',
      billerName: '',
      status: 'pending',
      isBilled: false,
      notes: '',
    },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'therapySessions',
  })

  const selectedTherapyIds = form.watch('selectedTherapyIds')
  const competence = form.watch('competence') // MM/yyyy

  // Converter para formato YYYY-MM para API
  const competenceApi =
    competence && /^\d{2}\/\d{4}$/.test(competence) ? `${competence.split('/')[1]}-${competence.split('/')[0]}` : ''

  // Buscar preços das terapias selecionadas
  const { data: therapyPrices, isLoading: loadingPrices } = useTherapyPricesByCompetence({
    therapyIds: selectedTherapyIds,
    competence: competenceApi,
    enabled: selectedTherapyIds.length > 0 && !!competenceApi,
  })

  // Handler para atualizar sessões quando terapias mudam
  const handleTherapySelectionChange = React.useCallback(
    (newTherapyIds: string[]) => {
      if (!therapies) return

      const currentSessions = form.getValues('therapySessions')
      const newSessions = newTherapyIds.map(therapyId => {
        const therapy = therapies.find(t => t.id === therapyId)
        const priceInfo = therapyPrices?.find(p => p.therapyId === therapyId)
        const existingSession = currentSessions.find(s => s.therapyId === therapyId)

        // Se for nova terapia, sessionsCount = 1, senão mantém o anterior
        const sessionsCount = existingSession ? existingSession.sessionsCount : 1

        return {
          therapyId,
          therapyName: therapy?.name || 'Terapia não encontrada',
          sessionValue: priceInfo?.value || 0,
          sessionsCount,
          totalValue: (priceInfo?.value || 0) * sessionsCount,
        }
      })

      form.setValue('therapySessions', newSessions)
    },
    [therapies, therapyPrices, form],
  )

  // Atualizar valores quando preços chegarem
  React.useEffect(() => {
    if (!therapyPrices || loadingPrices) return

    const currentSessions = form.getValues('therapySessions')
    if (currentSessions.length === 0) return

    let hasChanges = false
    const updatedSessions = currentSessions.map(session => {
      const priceInfo = therapyPrices.find(p => p.therapyId === session.therapyId)
      const newValue = priceInfo?.value || 0

      if (newValue !== session.sessionValue) {
        hasChanges = true
        return {
          ...session,
          sessionValue: newValue,
          totalValue: newValue * session.sessionsCount,
        }
      }
      return session
    })

    if (hasChanges) {
      form.setValue('therapySessions', updatedSessions)
    }
  }, [therapyPrices, loadingPrices, form])

  const updateSessionCount = (index: number, count: number) => {
    const currentSessions = form.getValues('therapySessions')
    const updatedSessions = [...currentSessions]

    if (updatedSessions[index]) {
      if (count <= 0) {
        // Remove da lista de sessões
        updatedSessions.splice(index, 1)
        form.setValue('therapySessions', updatedSessions, { shouldValidate: true })
        // Remove do select de terapias
        const selectedTherapyIds = form.getValues('selectedTherapyIds')
        const therapyIdToRemove = currentSessions[index].therapyId
        form.setValue(
          'selectedTherapyIds',
          selectedTherapyIds.filter(id => id !== therapyIdToRemove),
          { shouldValidate: true },
        )
      } else {
        updatedSessions[index] = {
          ...updatedSessions[index],
          sessionsCount: count,
          totalValue: updatedSessions[index].sessionValue * count,
        }
        form.setValue('therapySessions', updatedSessions, { shouldValidate: true })
      }
    }
  }

  const handleSubmit = async (data: BillingFormValues) => {
    // Filtrar apenas terapias com sessões > 0
    const validSessions = data.therapySessions.filter(session => session.sessionsCount > 0)

    if (validSessions.length === 0) {
      form.setError('therapySessions', {
        type: 'manual',
        message: 'Informe pelo menos uma sessão para alguma terapia',
      })
      return
    }

    // Criar um billing para cada terapia com sessões
    const billings = validSessions.map(session => ({
      patientId: data.patientId,
      therapyId: session.therapyId,
      customTherapyName: null,
      healthPlanId: data.healthPlanId || null,
      billingCycle: data.billingCycle || null,
      sessionValue: session.sessionValue,
      grossAmount: session.totalValue,
      netAmount: undefined,
      dueDate: data.dueDate || null,
      invoiceIssuedAt: data.invoiceIssuedAt || null,
      invoiceNumber: data.invoiceNumber || null,
      competenceDate: data.competenceDate,
      billerName: data.billerName || null,
      status: data.status,
      isBilled: data.isBilled,
      notes: data.notes || null,
    }))

    await onSubmit(billings)

    // Reset form
    form.reset({
      patientId: '',
      competenceDate: new Date(),
      healthPlanId: '',
      selectedTherapyIds: [],
      therapySessions: [],
      billingCycle: '',
      dueDate: undefined,
      invoiceIssuedAt: undefined,
      invoiceNumber: '',
      billerName: '',
      status: 'pending',
      isBilled: false,
      notes: '',
    })
  }

  const therapySessions = form.watch('therapySessions')
  const totalAmount = therapySessions.reduce((sum, session) => sum + session.totalValue, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Faturamento</DialogTitle>
          <DialogDescription>Selecione as terapias e informe o número de sessões para cada uma</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Patient Selector */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <FormControl>
                    <PatientSelector value={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competence Input MM/yyyy */}
            <FormField
              control={form.control}
              name="competence"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Competência *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="dia/mês/ano"
                      maxLength={7}
                      value={field.value}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '')
                        if (v.length > 6) v = v.slice(0, 6)
                        let masked = v
                        if (v.length > 2) {
                          masked = v.slice(0, 2) + '/' + v.slice(2)
                        }
                        field.onChange(masked)
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Health Plan Selector */}
            <FormField
              control={form.control}
              name="healthPlanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Saúde</FormLabel>
                  <FormControl>
                    <HealthPlanSelector value={field.value || undefined} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multiple Therapy Selector */}
            <FormField
              control={form.control}
              name="selectedTherapyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terapias *</FormLabel>
                  <FormControl>
                    <MultipleTherapySelector
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        if (therapies) {
                          handleTherapySelectionChange(value)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Selecione as terapias que serão faturadas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Therapy Sessions List */}
            {therapySessions.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Sessões por Terapia</h3>
                  <p className="text-muted-foreground text-sm">
                    Informe o número de sessões para cada terapia selecionada
                  </p>
                </div>

                <div className="space-y-3">
                  {therapySessions.map((session, index) => {
                    const priceInfo = therapyPrices?.find(p => p.therapyId === session.therapyId)
                    const hasPrice = !!priceInfo

                    return (
                      <div key={session.therapyId} className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{session.therapyName}</h4>
                            <p className="text-muted-foreground text-sm">
                              {hasPrice
                                ? `Valor por sessão: R$ ${session.sessionValue.toFixed(2)}`
                                : 'Valor não encontrado para esta competência'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Total: R$ {session.totalValue.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateSessionCount(index, Math.max(0, session.sessionsCount - 1))}
                            disabled={session.sessionsCount <= 0 || !hasPrice}>
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            min="0"
                            value={session.sessionsCount}
                            onChange={e => updateSessionCount(index, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 text-center"
                            disabled={!hasPrice}
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateSessionCount(index, session.sessionsCount + 1)}
                            disabled={!hasPrice}>
                            <Plus className="h-4 w-4" />
                          </Button>

                          <span className="text-muted-foreground ml-2 text-sm">sessões</span>
                        </div>

                        {!hasPrice && (
                          <p className="text-destructive text-sm">
                            Não foi possível encontrar o valor desta terapia para a competência selecionada
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {totalAmount > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Total Geral:</span>
                      <span className="text-lg font-bold">R$ {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loadingPrices && therapySessions.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground text-sm">Carregando valores das terapias...</p>
              </div>
            )}

            {/* Additional Fields */}
            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="dia/mês/ano"
                          maxLength={10}
                          value={field.value || ''}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, '')
                            if (v.length > 8) v = v.slice(0, 8)
                            let masked = v
                            if (v.length > 4) {
                              masked = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
                            } else if (v.length > 2) {
                              masked = v.slice(0, 2) + '/' + v.slice(2)
                            }
                            field.onChange(masked)
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceIssuedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Emissão da NF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="dia/mês/ano"
                          maxLength={10}
                          value={field.value || ''}
                          onChange={e => {
                            let v = e.target.value.replace(/\D/g, '')
                            if (v.length > 8) v = v.slice(0, 8)
                            let masked = v
                            if (v.length > 4) {
                              masked = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
                            } else if (v.length > 2) {
                              masked = v.slice(0, 2) + '/' + v.slice(2)
                            }
                            field.onChange(masked)
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Invoice Number */}
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NF-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Biller Name */}
              <FormField
                control={form.control}
                name="billerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Faturista</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="sent">Enviado</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Billed */}
              <FormField
                control={form.control}
                name="isBilled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Faturado?</FormLabel>
                      <FormDescription>Marque se o faturamento já foi realizado</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre o faturamento"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={totalAmount === 0}>
                Criar Faturamentos
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
