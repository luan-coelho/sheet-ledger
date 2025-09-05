import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

import type { Patient } from '@/app/db/schemas/patient-schema'
import type { Professional } from '@/app/db/schemas/professional-schema'

import type { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'
import { areTimesProvided, getTimeValidationError, isValidTimeRange } from '@/lib/time-utils'

/**
 * Hook para gerenciar a seleção de profissional e auto-preenchimento de campos relacionados
 */
export function useProfessionalHandler(form: UseFormReturn<SpreadsheetFormValues>, professionals?: Professional[]) {
  const handleProfessionalChange = (professionalId: string | undefined) => {
    // Primeiro atualiza o professionalId
    form.setValue('professionalId', professionalId || '')

    if (!professionalId || !professionals) return

    // Busca o profissional selecionado
    const selectedProfessional = professionals.find(p => p.id === professionalId)

    if (selectedProfessional) {
      // Preenche automaticamente os campos relacionados ao profissional
      form.setValue('licenseNumber', selectedProfessional.councilNumber || '')
      form.setValue('therapyId', selectedProfessional.therapyId || '')
    }
  }

  return { handleProfessionalChange }
}

/**
 * Hook para gerenciar a seleção de paciente e auto-preenchimento de campos relacionados
 */
export function usePatientHandler(form: UseFormReturn<SpreadsheetFormValues>, patients?: Patient[]) {
  const handlePatientChange = (patientId: string | undefined) => {
    // Primeiro atualiza o patientId
    form.setValue('patientId', patientId || '')

    if (!patientId || !patients) return

    // Busca o paciente selecionado
    const selectedPatient = patients.find(p => p.id === patientId)

    if (selectedPatient) {
      // Preenche automaticamente os campos relacionados ao paciente
      form.setValue('guardian', selectedPatient.guardian || '')
      form.setValue('healthPlanId', selectedPatient.healthPlanId || '')
      form.setValue('cardNumber', selectedPatient.cardNumber || '')
      form.setValue('guideNumber', selectedPatient.guideNumber || '')
    }
  }

  return { handlePatientChange }
}

/**
 * Hook para gerenciar a aplicação de horários globais
 */
export function useGlobalTimeHandler(form: UseFormReturn<SpreadsheetFormValues>) {
  const applyGlobalTimes = (globalStartTime: string, globalEndTime: string) => {
    if (!areTimesProvided(globalStartTime, globalEndTime)) {
      toast.error(getTimeValidationError('missing'))
      return
    }

    if (!isValidTimeRange(globalStartTime, globalEndTime)) {
      toast.error(getTimeValidationError('invalid'))
      return
    }

    const currentWeekDaySessions = form.getValues('weekDaySessions')

    if (currentWeekDaySessions.length === 0) {
      toast.error('Selecione pelo menos um dia da semana antes de aplicar os horários')
      return
    }

    // Aplicar os horários globais a todos os dias selecionados
    const updatedWeekDaySessions = currentWeekDaySessions.map(session => ({
      ...session,
      startTime: globalStartTime,
      endTime: globalEndTime,
    }))

    form.setValue('weekDaySessions', updatedWeekDaySessions)
    toast.success(`Horários aplicados a ${currentWeekDaySessions.length} dia(s) selecionado(s)`)
  }

  return { applyGlobalTimes }
}
