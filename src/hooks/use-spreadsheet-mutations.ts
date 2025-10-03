import { useMutation } from '@tanstack/react-query'

import { WeekDays } from '@/lib/spreadsheet-schema'

// Types
export interface TransformedFormData {
  professional: string
  licenseNumber: string
  authorizedSession?: string
  patientName: string
  responsible: string
  healthPlan: string
  therapy: string
  cardNumber?: string
  guideNumber?: string
  company: string
  companyData?: {
    name: string
    cnpj: string
    address: string
  }
  weekDaySessions: Array<{ day: WeekDays; sessions: number; startTime?: string; endTime?: string }>
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export interface GenerateSpreadsheetResponse {
  blob: Blob
  isMultiMonth: boolean
}

export interface GenerateDriveSpreadsheetResponse {
  success: boolean
  message: string
  patientFolder: string
  files: Array<{
    id: string
    name: string
    month: string
    year: number
  }>
}

export interface CheckExistingFilesResponse {
  hasExistingFiles: boolean
  existingFiles: Array<{
    name: string
    modifiedTime: string
  }>
}

export interface CheckExistingFilesParams {
  patientName: string
  startDate: string
  endDate: string
}

// Hook para gerar planilha local
export function useGenerateSpreadsheet() {
  return useMutation<GenerateSpreadsheetResponse, Error, TransformedFormData>({
    mutationFn: async data => {
      const startDateObj = new Date(data.startDate + 'T00:00:00')
      const endDateObj = new Date(data.endDate + 'T00:00:00')
      const isMultiMonth =
        startDateObj.getMonth() !== endDateObj.getMonth() || startDateObj.getFullYear() !== endDateObj.getFullYear()

      const apiEndpoint = isMultiMonth ? '/api/generate-spreadsheet-multi' : '/api/generate-spreadsheet'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar planilha')
      }

      const blob = await response.blob()
      return { blob, isMultiMonth }
    },
    onSuccess: ({ blob, isMultiMonth }) => {
      // Criar download automático
      const downloadUrl = window.URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl
      downloadLink.download = isMultiMonth ? 'registros-atendimentos.zip' : 'registro-atendimento.xlsx'

      document.body.appendChild(downloadLink)
      downloadLink.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(downloadLink)
    },
  })
}
