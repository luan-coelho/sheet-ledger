'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { insertBillingSchema } from '@/app/db/schemas/billing-schema'

import { HealthPlanSelector } from '@/components/health-plan-selector'
import { PatientSelector } from '@/components/patient-selector'
import { TherapySelector } from '@/components/therapy-selector'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { centsToDecimal } from '@/lib/billing-utils'

// Use a simplified form schema without refinements
const billingFormSchema = z.object({
  patientId: z.string().uuid({ message: 'Paciente é obrigatório' }),
  therapyId: z.string().optional().or(z.literal('')),
  customTherapyName: z.string().optional().or(z.literal('')),
  healthPlanId: z.string().optional().or(z.literal('')),
  billingCycle: z.string().optional().or(z.literal('')),
  sessionValue: z.string().min(1, 'Valor da sessão é obrigatório'),
  grossAmount: z.string().min(1, 'Valor bruto é obrigatório'),
  netAmount: z.string().optional().or(z.literal('')),
  dueDate: z.date().optional(),
  invoiceIssuedAt: z.date().optional(),
  invoiceNumber: z.string().optional().or(z.literal('')),
  competenceDate: z.date().optional(),
  billerName: z.string().optional().or(z.literal('')),
  status: z.enum(['pending', 'scheduled', 'sent', 'paid', 'cancelled']),
  isBilled: z.boolean(),
  notes: z.string().optional().or(z.literal('')),
})

type BillingFormValues = z.infer<typeof billingFormSchema>

interface BillingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof insertBillingSchema>) => void | Promise<void>
  defaultValues?: Partial<BillingFormValues>
  mode?: 'create' | 'edit'
}

export function BillingForm({ open, onOpenChange, onSubmit, defaultValues, mode = 'create' }: BillingFormProps) {
  const [useCustomTherapy, setUseCustomTherapy] = React.useState(Boolean(defaultValues?.customTherapyName))

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patientId: defaultValues?.patientId || '',
      therapyId: defaultValues?.therapyId || '',
      customTherapyName: defaultValues?.customTherapyName || '',
      healthPlanId: defaultValues?.healthPlanId || '',
      billingCycle: defaultValues?.billingCycle || '',
      sessionValue: defaultValues?.sessionValue ? centsToDecimal(Number(defaultValues.sessionValue)) : '',
      grossAmount: defaultValues?.grossAmount ? centsToDecimal(Number(defaultValues.grossAmount)) : '',
      netAmount: defaultValues?.netAmount ? centsToDecimal(Number(defaultValues.netAmount)) : '',
      dueDate: defaultValues?.dueDate,
      invoiceIssuedAt: defaultValues?.invoiceIssuedAt,
      invoiceNumber: defaultValues?.invoiceNumber || '',
      competenceDate: defaultValues?.competenceDate,
      billerName: defaultValues?.billerName || '',
      status: defaultValues?.status || 'pending',
      isBilled: defaultValues?.isBilled || false,
      notes: defaultValues?.notes || '',
    },
  })

  const handleSubmit = async (data: BillingFormValues) => {
    // Manual validation for therapy selection
    if (!useCustomTherapy && !data.therapyId) {
      form.setError('therapyId', {
        type: 'manual',
        message: 'Selecione uma terapia ou marque para usar terapia personalizada',
      })
      return
    }

    if (useCustomTherapy && !data.customTherapyName) {
      form.setError('customTherapyName', {
        type: 'manual',
        message: 'Digite o nome da terapia personalizada',
      })
      return
    }

    // Transform data to match insertBillingSchema
    const transformedData = {
      patientId: data.patientId,
      therapyId: useCustomTherapy || !data.therapyId ? null : data.therapyId,
      customTherapyName: useCustomTherapy && data.customTherapyName ? data.customTherapyName : null,
      healthPlanId: data.healthPlanId || null,
      billingCycle: data.billingCycle || null,
      sessionValue: data.sessionValue,
      grossAmount: data.grossAmount,
      netAmount: data.netAmount || undefined,
      dueDate: data.dueDate || null,
      invoiceIssuedAt: data.invoiceIssuedAt || null,
      invoiceNumber: data.invoiceNumber || null,
      competenceDate: data.competenceDate || null,
      billerName: data.billerName || null,
      status: data.status,
      isBilled: data.isBilled,
      notes: data.notes || null,
    }

    // Validate with insertBillingSchema
    const result = insertBillingSchema.safeParse(transformedData)
    if (!result.success) {
      // Set errors from Zod validation
      result.error.errors.forEach(err => {
        const path = err.path[0] as keyof BillingFormValues
        form.setError(path, {
          type: 'manual',
          message: err.message,
        })
      })
      return
    }

    await onSubmit(result.data)

    form.reset({
      patientId: '',
      therapyId: '',
      customTherapyName: '',
      healthPlanId: '',
      billingCycle: '',
      sessionValue: '',
      grossAmount: '',
      netAmount: '',
      dueDate: undefined,
      invoiceIssuedAt: undefined,
      invoiceNumber: '',
      competenceDate: undefined,
      billerName: '',
      status: 'pending',
      isBilled: false,
      notes: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Faturamento' : 'Editar Faturamento'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados para criar um novo faturamento'
              : 'Atualize os dados do faturamento'}
          </DialogDescription>
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

            {/* Therapy Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-custom-therapy"
                  checked={useCustomTherapy}
                  onCheckedChange={checked => {
                    setUseCustomTherapy(checked)
                    if (checked) {
                      form.setValue('therapyId', '')
                    } else {
                      form.setValue('customTherapyName', '')
                    }
                  }}
                />
                <label
                  htmlFor="use-custom-therapy"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Usar terapia personalizada
                </label>
              </div>

              {useCustomTherapy ? (
                <FormField
                  control={form.control}
                  name="customTherapyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Terapia Personalizada *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da terapia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="therapyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terapia *</FormLabel>
                      <FormControl>
                        <TherapySelector value={field.value || undefined} onValueChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

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

            {/* Billing Cycle */}
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclo de Faturamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mensal, Quinzenal" {...field} />
                  </FormControl>
                  <FormDescription>Período de cobrança (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency Values */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="sessionValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Sessão *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0,00"
                        {...field}
                        onChange={e => {
                          const value = e.target.value.replace(/[^\d,]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Em reais</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grossAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Bruto *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0,00"
                        {...field}
                        onChange={e => {
                          const value = e.target.value.replace(/[^\d,]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Em reais</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="netAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Líquido</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0,00"
                        {...field}
                        onChange={e => {
                          const value = e.target.value.replace(/[^\d,]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Em reais (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} onSelect={field.onChange} placeholder="Selecione a data" />
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
                      <DatePicker date={field.value} onSelect={field.onChange} placeholder="Selecione a data" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competenceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Competência</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} onSelect={field.onChange} placeholder="Selecione a data" />
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

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{mode === 'create' ? 'Criar Faturamento' : 'Salvar Alterações'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
