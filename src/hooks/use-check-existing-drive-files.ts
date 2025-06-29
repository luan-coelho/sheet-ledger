import { useMutation } from '@tanstack/react-query'

interface CheckExistingFilesData {
  patientName: string
  startDate: string
  endDate: string
}

interface ExistingFile {
  id: string
  name: string
  modifiedTime: string
  month: string
  year: number
}

interface CheckExistingFilesResponse {
  hasExistingFiles: boolean
  existingFiles: ExistingFile[]
  totalFiles: number
}

export function useCheckExistingDriveFiles() {
  return useMutation({
    mutationFn: async (data: CheckExistingFilesData): Promise<CheckExistingFilesResponse> => {
      const response = await fetch('/api/google-drive/check-existing-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao verificar arquivos existentes no Google Drive')
      }

      return result
    },
  })
}
