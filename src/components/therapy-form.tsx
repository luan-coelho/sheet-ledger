'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { insertTherapySchema, Therapy, TherapyFormValues } from '@/app/db/schemas/therapy-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { useCreateTherapy, useUpdateTherapy } from '@/hooks/use-therapies'

interface TherapyFormProps {
  therapy?: Therapy
  onSuccess?: () => void
  onCancel?: () => void
}

export function TherapyForm({ therapy, onSuccess, onCancel }: TherapyFormProps) {
  const isEditing = !!therapy

  const form = useForm<TherapyFormValues>({
    resolver: zodResolver(insertTherapySchema),
    defaultValues: {
      name: therapy?.name || '',
      active: therapy?.active ?? true,
    },
  })

  const createMutation = useCreateTherapy()
  const updateMutation = useUpdateTherapy()

  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (therapy) {
      form.reset({
        name: therapy.name,
        active: therapy.active,
      })
    }
  }, [therapy, form])

  async function onSubmit(values: TherapyFormValues) {
    try {
      if (isEditing && therapy) {
        await updateMutation.mutateAsync({
          id: therapy.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar terapia:', error)
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
              <FormLabel>Nome da Terapia</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da terapia" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Terapia Ativa</FormLabel>
                <p className="text-muted-foreground text-sm">Marque para manter a terapia ativa no sistema</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
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
            {isEditing ? 'Atualizar' : 'Criar'} Terapia
          </Button>
        </div>
      </form>
    </Form>
  )
}
