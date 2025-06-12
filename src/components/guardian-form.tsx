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
import { insertGuardianSchema, GuardianFormValues, Guardian } from '@/lib/schemas/guardian-schema'
import { useCreateGuardian, useUpdateGuardian } from '@/hooks/use-guardians'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface GuardianFormProps {
  guardian?: Guardian
  onSuccess?: () => void
  onCancel?: () => void
}

export function GuardianForm({ guardian, onSuccess, onCancel }: GuardianFormProps) {
  const isEditing = !!guardian
  
  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(insertGuardianSchema),
    defaultValues: {
      name: guardian?.name || '',
    },
  })

  const createMutation = useCreateGuardian()
  const updateMutation = useUpdateGuardian()

  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (guardian) {
      form.reset({
        name: guardian.name,
      })
    }
  }, [guardian, form])

  async function onSubmit(values: GuardianFormValues) {
    try {
      if (isEditing && guardian) {
        await updateMutation.mutateAsync({
          id: guardian.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }
      
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar responsável:', error)
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
              <FormLabel>Nome do Responsável</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do responsável"
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
            {isEditing ? 'Atualizar' : 'Criar'} Responsável
          </Button>
        </div>
      </form>
    </Form>
  )
}
