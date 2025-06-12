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
import { insertHealthPlanSchema, HealthPlanFormValues, HealthPlan } from '@/lib/schemas/health-plan-schema'
import { useCreateHealthPlan, useUpdateHealthPlan } from '@/hooks/use-health-plans'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface HealthPlanFormProps {
  healthPlan?: HealthPlan
  onSuccess?: () => void
  onCancel?: () => void
}

export function HealthPlanForm({ healthPlan, onSuccess, onCancel }: HealthPlanFormProps) {
  const isEditing = !!healthPlan
  
  const form = useForm<HealthPlanFormValues>({
    resolver: zodResolver(insertHealthPlanSchema),
    defaultValues: {
      name: healthPlan?.name || '',
    },
  })

  const createMutation = useCreateHealthPlan()
  const updateMutation = useUpdateHealthPlan()

  const isLoading = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (healthPlan) {
      form.reset({
        name: healthPlan.name,
      })
    }
  }, [healthPlan, form])

  async function onSubmit(values: HealthPlanFormValues) {
    try {
      if (isEditing && healthPlan) {
        await updateMutation.mutateAsync({
          id: healthPlan.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }
      
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar plano de saúde:', error)
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
              <FormLabel>Nome do Plano de Saúde</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do plano de saúde"
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
            {isEditing ? 'Atualizar' : 'Criar'} Plano de Saúde
          </Button>
        </div>
      </form>
    </Form>
  )
}
