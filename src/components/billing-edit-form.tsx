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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { centsToDecimal } from '@/lib/billing-utils'

// Schema para o formulário de edição
const billingEditFormSchema = z.object({
  patientId: z.string().uuid({ message: 'Paciente é obrigatório' }),
  therapyId: z.string().uuid({ message: 'Terapia é obrigatória' }),
  healthPlanId: z.string().optional().or(z.literal('')),
  competence: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Competência deve estar no formato MM/yyyy'),
  sessionValue: z.string().min(1, 'Valor da sessão é obrigatório'),
  grossAmount: z.string().min(1, 'Valor bruto é obrigatório'),
  netAmount: z.string().optional().or(z.literal('')),
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

type BillingEditFormValues = z.infer<typeof billingEditFormSchema>

interface BillingEditFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: z.infer<typeof insertBillingSchema>) => void | Promise<void>
  defaultValues?: Partial<BillingEditFormValues>
}

export function BillingEditForm({ open, onOpenChange, onSubmit, defaultValues }: BillingEditFormProps) {
  const form = useForm<BillingEditFormValues>({
    resolver: zodResolver(billingEditFormSchema),
    defaultValues: {
      patientId: defaultValues?.patientId || '',
      therapyId: defaultValues?.therapyId || '',
      healthPlanId: defaultValues?.healthPlanId || '',
      competence: defaultValues?.competence || '',
      sessionValue: defaultValues?.sessionValue || '',
      grossAmount: defaultValues?.grossAmount || '',
      netAmount: defaultValues?.netAmount || '',
      dueDate: defaultValues?.dueDate || '',
      invoiceIssuedAt: defaultValues?.invoiceIssuedAt || '',
      invoiceNumber: defaultValues?.invoiceNumber || '',
      billerName: defaultValues?.billerName || '',
      status: defaultValues?.status || 'pending',
      isBilled: defaultValues?.isBilled || false,
      notes: defaultValues?.notes || '',
    },
  })

  const handleSubmit = async (data: BillingEditFormValues) => {
    // Converter competence MM/yyyy para Date
    const [month, year] = data.competence.split('/')
    const competenceDate = new Date(parseInt(year), parseInt(month) - 1, 1)

    // Converter datas dd/MM/yyyy para Date
    const parseDateString = (dateStr: string | undefined): Date | null => {
      if (!dateStr || dateStr === '') return null
      const [day, month, year] = dateStr.split('/')
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }

    // Converter valores monetários para número
    const parseMoneyString = (value: string): number => {
      return parseFloat(value.replace(',', '.'))
    }

    // Transform data to match insertBillingSchema
    const transformedData = {
      patientId: data.patientId,
      therapyId: data.therapyId,
      customTherapyName: null,
      healthPlanId: data.healthPlanId || null,
      billingCycle: null,
      sessionValue: parseMoneyString(data.sessionValue),
      grossAmount: parseMoneyString(data.grossAmount),
      netAmount: data.netAmount ? parseMoneyString(data.netAmount) : undefined,
      dueDate: parseDateString(data.dueDate),
      invoiceIssuedAt: parseDateString(data.invoiceIssuedAt),
      invoiceNumber: data.invoiceNumber || null,
      competenceDate,
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
        const path = err.path[0] as keyof BillingEditFormValues
        form.setError(path, {
          type: 'manual',
          message: err.message,
        })
      })
      return
    }

    await onSubmit(result.data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Faturamento</DialogTitle>
          <DialogDescription>Atualize os dados do faturamento</DialogDescription>
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

            {/* Therapy Selector */}
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

            {/* Competence Input MM/yyyy */}
            <FormField
              control={form.control}
              name="competence"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Competência *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MM/aaaa"
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
                  <FormDescription>Informe a competência no formato MM/aaaa</FormDescription>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="dd/mm/aaaa"
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
                    <FormDescription>Formato: dd/mm/aaaa</FormDescription>
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
                        placeholder="dd/mm/aaaa"
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
                    <FormDescription>Formato: dd/mm/aaaa</FormDescription>
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
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
