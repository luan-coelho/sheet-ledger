'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Company, CompanyFormValues, insertCompanySchema } from '@/app/db/schemas/company-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useCreateCompany, useUpdateCompany } from '@/hooks/use-companies'

import { formatCNPJ, unformatCNPJ } from '@/lib/utils'

interface CompanyFormProps {
  company?: Company
  onSuccess?: () => void
  onCancel?: () => void
}

export function CompanyForm({ company, onSuccess, onCancel }: CompanyFormProps) {
  const isEditing = !!company
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: '',
      cnpj: '',
      address: '',
    },
  })

  // Preenche o formulário quando está editando
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        cnpj: company.cnpj,
        address: company.address,
      })
    }
  }, [company, form])

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: company.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      // Erro já é tratado no hook
      console.error('Erro ao salvar empresa:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da empresa..." {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  value={formatCNPJ(field.value || '')}
                  onChange={e => {
                    const unformattedValue = unformatCNPJ(e.target.value)
                    field.onChange(unformattedValue)
                  }}
                  disabled={isLoading}
                  maxLength={18}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite o endereço da empresa..." {...field} disabled={isLoading} rows={3} />
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
            {isEditing ? 'Atualizar' : 'Criar'} Empresa
          </Button>
        </div>
      </form>
    </Form>
  )
}
