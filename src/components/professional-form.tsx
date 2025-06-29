'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { insertProfessionalSchema, Professional, ProfessionalFormValues } from '@/app/db/schemas/professional-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreateProfessional, useUpdateProfessional } from '@/hooks/use-professionals'

interface ProfessionalFormProps {
  professional?: Professional
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfessionalForm({ professional, onSuccess, onCancel }: ProfessionalFormProps) {
  const isEditing = !!professional

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(insertProfessionalSchema),
    defaultValues: {
      name: professional?.name || '',
    },
  })

  const createMutation = useCreateProfessional()
  const updateMutation = useUpdateProfessional()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset form when professional changes
  useEffect(() => {
    if (professional) {
      form.reset({
        name: professional.name,
      })
    }
  }, [professional, form])

  async function onSubmit(values: ProfessionalFormValues) {
    try {
      if (isEditing && professional) {
        await updateMutation.mutateAsync({
          id: professional.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar profissional:', error)
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
              <FormLabel>Nome do Profissional</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do profissional" {...field} disabled={isLoading} />
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
            {isEditing ? 'Atualizar' : 'Criar'} Profissional
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
