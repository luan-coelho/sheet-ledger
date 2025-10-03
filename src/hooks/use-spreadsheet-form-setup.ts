import { zodResolver } from '@hookform/resolvers/zod'
import { Resolver, useForm } from 'react-hook-form'

import { formatDateISO, getFirstDayOfMonth, getLastDayOfMonth, getNowInBrazil } from '@/lib/date-utils'
import { spreadsheetFormSchema, WeekDays, type SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

/**
 * Hook para gerenciar o estado e configuração do formulário de planilha
 */
export function useSpreadsheetFormSetup() {
  // Obter datas atuais para valores padrão
  const today = getNowInBrazil()
  const firstDayOfMonth = getFirstDayOfMonth(today.getFullYear(), today.getMonth())
  const lastDayOfMonth = getLastDayOfMonth(today.getFullYear(), today.getMonth())

  const form = useForm<SpreadsheetFormValues, unknown, SpreadsheetFormValues>({
    mode: 'onChange',
    resolver: zodResolver(spreadsheetFormSchema) as Resolver<SpreadsheetFormValues, unknown, SpreadsheetFormValues>,
    defaultValues: {
      professionalId: '',
      licenseNumber: '',
      authorizedSession: '',
      patientId: '',
      guardian: '',
      companyId: '',
      healthPlanId: '',
      therapyId: '',
      cardNumber: '',
      guideNumber: '',
      weekDaySessions: [{ day: WeekDays.MONDAY, sessions: 4 }],
      startDate: formatDateISO(firstDayOfMonth),
      endDate: formatDateISO(lastDayOfMonth),
      dateOverrides: [],
    },
  })

  return { form }
}

/**
 * Hook para gerenciar os estados de loading e error do formulário
 */
export function useFormLoadingStates(
  generateSpreadsheet: { isPending: boolean; error: Error | null },
  generateDriveSpreadsheet: { isPending: boolean; error: Error | null },
  checkExistingFiles: { isPending: boolean; error: Error | null },
) {
  const isLoading = generateSpreadsheet.isPending || generateDriveSpreadsheet.isPending
  const isCheckingFiles = checkExistingFiles.isPending
  const error = generateSpreadsheet.error || generateDriveSpreadsheet.error || checkExistingFiles.error

  return { isLoading, isCheckingFiles, error }
}
