import type { Company } from '@/app/db/schemas/company-schema'
import type { HealthPlan } from '@/app/db/schemas/health-plan-schema'
import type { Patient } from '@/app/db/schemas/patient-schema'
import type { Professional } from '@/app/db/schemas/professional-schema'
import type { Therapy } from '@/app/db/schemas/therapy-schema'

import type { TransformedFormData } from '@/hooks/use-spreadsheet-mutations'

import type { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

/**
 * Transforma os dados do formulário para o formato esperado pela API
 * @param values Valores do formulário
 * @param entities Objetos das entidades relacionadas
 * @returns Dados transformados para a API
 */
export function transformFormDataToApi(
  values: SpreadsheetFormValues,
  entities: {
    professionals?: Professional[]
    patients?: Patient[]
    companies?: Company[]
    healthPlans?: HealthPlan[]
    therapies?: Therapy[]
  },
): TransformedFormData {
  const { professionals, patients, companies, healthPlans, therapies } = entities

  const professional = professionals?.find(p => p.id === values.professionalId)
  const patient = patients?.find(p => p.id === values.patientId)
  const company = companies?.find(c => c.id === values.companyId)
  const healthPlan = healthPlans?.find(h => h.id === values.healthPlanId)
  const therapy = therapies?.find(t => t.id === values.therapyId)

  // Calcular horário mais cedo e mais tarde dos dias selecionados
  const dateOverrides = values.dateOverrides ?? []
  const { earliestTime, latestTime } = calculateTimeRange(values.weekDaySessions, dateOverrides)

  return {
    professional: professional?.name || '',
    licenseNumber: values.licenseNumber,
    authorizedSession: values.authorizedSession || undefined,
    patientName: patient?.name || '',
    responsible: values.guardian,
    healthPlan: healthPlan?.name || '',
    therapy: therapy?.name || '',
    cardNumber: values.cardNumber || undefined,
    guideNumber: values.guideNumber || undefined,
    company: company?.name || '',
    companyData: company
      ? {
          name: company.name,
          cnpj: company.cnpj,
          address: company.address,
        }
      : undefined,
    weekDaySessions: values.weekDaySessions,
    startDate: values.startDate,
    endDate: values.endDate,
    startTime: earliestTime,
    endTime: latestTime,
    dateOverrides,
  }
}

/**
 * Calcula o horário mais cedo e mais tarde dos dias selecionados
 * @param weekDaySessions Sessões da semana
 * @returns Objeto com earliestTime e latestTime
 */
function calculateTimeRange(
  weekDaySessions: SpreadsheetFormValues['weekDaySessions'],
  dateOverrides: NonNullable<SpreadsheetFormValues['dateOverrides']>,
): {
  earliestTime: string
  latestTime: string
} {
  let earliestTime: string | null = null
  let latestTime: string | null = null

  const considerTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return

    if (!earliestTime || startTime < earliestTime) {
      earliestTime = startTime
    }

    if (!latestTime || endTime > latestTime) {
      latestTime = endTime
    }
  }

  weekDaySessions.forEach(session => {
    considerTimeRange(session.startTime, session.endTime)
  })

  dateOverrides.forEach(override => {
    considerTimeRange(override.startTime, override.endTime)
  })

  return {
    earliestTime: earliestTime ?? '08:00',
    latestTime: latestTime ?? '17:00',
  }
}
