'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfessionalForm } from './professional-form'
import { Professional } from '@/app/db/schemas/professional-schema'

interface ProfessionalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  professional?: Professional
}

export function ProfessionalModal({ open, onOpenChange, professional }: ProfessionalModalProps) {
  const isEditing = !!professional

  const handleSuccess = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do profissional.' : 'Adicione um novo profissional ao sistema.'}
          </DialogDescription>
        </DialogHeader>

        <ProfessionalForm professional={professional} onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  )
}
