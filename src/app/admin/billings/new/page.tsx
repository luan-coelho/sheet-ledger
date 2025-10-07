'use client'

import { ArrowLeft, Receipt } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { insertBillingSchema } from '@/app/db/schemas/billing-schema'

import { BillingForm } from '@/components/billing-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useCreateMultipleBillings } from '@/hooks/use-billings'

export default function NewBillingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createMultipleMutation = useCreateMultipleBillings()

  const handleCreate = async (billings: Array<ReturnType<typeof insertBillingSchema.parse>>) => {
    setIsSubmitting(true)
    try {
      await createMultipleMutation.mutateAsync(billings)
      router.push('/admin/billings')
    } catch (error) {
      console.error('Error creating billings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Faturamento</h1>
            <p className="text-muted-foreground">Crie um novo faturamento para seus pacientes</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Faturamento</CardTitle>
          <CardDescription>Preencha as informações necessárias para criar o faturamento</CardDescription>
        </CardHeader>
        <CardContent>
          <BillingForm
            open={true}
            onOpenChange={handleCancel}
            onSubmit={handleCreate}
            mode="create"
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
