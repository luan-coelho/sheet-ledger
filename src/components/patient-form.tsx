"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { insertPatientSchema, PatientFormValues, Patient } from '@/lib/schemas/patient-schema'
import { useCreatePatient, useUpdatePatient } from '@/hooks/use-patients'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

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
                <Input
                  placeholder="Digite o nome do paciente"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Paciente
          </Button>
        </div>

        {(createMutation.error || updateMutation.error) && (
          <div className="text-sm text-destructive">
            {createMutation.error?.message || updateMutation.error?.message}
          </div>
        )}
      </form>
    </Form>
  )
}
