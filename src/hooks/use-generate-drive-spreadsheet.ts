import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SpreadsheetFormValues } from '@/lib/spreadsheet-schema'

interface GenerateDriveSpreadsheetData {
  professional: string
  licenseNumber: string
  authorizedSession: string
  patientName: string
  responsible: string
  healthPlan: string
  weekDaySessions: SpreadsheetFormValues['weekDaySessions']
  dataInicio: string
  dataFim: string
}

interface GenerateDriveSpreadsheetResponse {
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

export function useGenerateDriveSpreadsheet() {
  return useMutation({
    mutationFn: async (data: GenerateDriveSpreadsheetData): Promise<GenerateDriveSpreadsheetResponse> => {
      const response = await fetch('/api/generate-spreadsheet-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar planilhas no Google Drive')
      }

      return result
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        description: `Pasta: "${data.patientFolder}" | Arquivos: ${data.files.map(f => f.name).join(', ')}`,
        duration: 5000,
      })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar planilhas no Google Drive')
    },
  })
} 