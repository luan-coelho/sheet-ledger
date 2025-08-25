'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { insertPatientSchema, Patient, PatientFormValues } from '@/app/db/schemas/patient-schema'

import { HealthPlanSelector } from '@/components/health-plan-selector'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreatePatient, useUpdatePatient } from '@/hooks/use-patients'

interface PatientFormProps {
  patient?: Patient
  onSuccess?: () => void
  onCancel?: () => void
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const isEditing = !!patient

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      name: patient?.name || '',
      guardian: patient?.guardian || '',
      healthPlanId: patient?.healthPlanId || undefined,
      cardNumber: patient?.cardNumber || '',
      guideNumber: patient?.guideNumber || '',
    },
  })

  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset form when patient changes
  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        guardian: patient.guardian,
        healthPlanId: patient.healthPlanId || undefined,
        cardNumber: patient.cardNumber || '',
        guideNumber: patient.guideNumber || '',
      })
    }
  }, [patient, form])

  async function onSubmit(values: PatientFormValues) {
    try {
      if (isEditing && patient) {
        await updateMutation.mutateAsync({
          id: patient.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Paciente</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do paciente" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guardian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do responsável" {...field} disabled={isLoading} />
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
              <FormLabel>Plano de Saúde (Opcional)</FormLabel>
              <FormControl>
                <HealthPlanSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione um plano de saúde"
                  disabled={isLoading}
                  error={form.formState.errors.healthPlanId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Carteirinha (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o número da carteirinha" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guideNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Guia (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o número da guia" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Paciente
          </Button>
        </div>

        {(createMutation.error || updateMutation.error) && (
          <div className="text-destructive text-sm">
            {createMutation.error?.message || updateMutation.error?.message}
          </div>
        )}
      </form>
    </Form>
  )
}
