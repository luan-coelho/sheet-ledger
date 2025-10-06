import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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

  const form = useForm<SpreadsheetFormValues>({
    mode: 'onChange',
    resolver: zodResolver(spreadsheetFormSchema),
    defaultValues: {
      professionalId: '',
      licenseNumber: '',
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
      advancedSchedule: {
        enabled: true,
        exceptions: [],
      },
    },
  })

  return { form }
}

/**
 * Hook para gerenciar os estados de loading e error do formulário
 */
export function useFormLoadingStates(generateSpreadsheet: { isPending: boolean; error: Error | null }) {
  const isLoading = generateSpreadsheet.isPending
  const error = generateSpreadsheet.error

  return { isLoading, error }
}
