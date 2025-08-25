'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { insertPatientSchema, Patient, PatientFormValues } from '@/app/db/schemas/patient-schema'

import { ProfessionalSelector } from '@/components/professional-selector'
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
      professionalId: patient?.professionalId || undefined,
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
        professionalId: patient.professionalId || undefined,
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
          name="professionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissional Responsável</FormLabel>
              <FormControl>
                <ProfessionalSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione o profissional responsável..."
                  disabled={isLoading}
                  error={form.formState.errors.professionalId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
