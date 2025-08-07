import { useQuery } from '@tanstack/react-query'

import { fetchGoogleDriveApi } from '@/lib/google-drive-api-utils'

interface RestrictedDriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
  thumbnailLink?: string
  iconLink?: string
}

interface RestrictedDriveFolder {
  id: string
  name: string
  parents?: string[]
  modifiedTime: string
}

interface DriveData {
  appRootFolder: RestrictedDriveFolder
  files: RestrictedDriveFile[]
  currentFolderId: string
}

async function fetchRestrictedDriveFiles(folderId?: string): Promise<DriveData> {
  const url = folderId ? `/api/google-drive/restricted?folderId=${folderId}` : '/api/google-drive/restricted'

  return fetchGoogleDriveApi<DriveData>(url, undefined, 'Erro ao carregar arquivos')
}

export function useRestrictedGoogleDrive(folderId?: string) {
  return useQuery({
    queryKey: ['restricted-google-drive', folderId],
    queryFn: () => fetchRestrictedDriveFiles(folderId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  })
}

export type { RestrictedDriveFile, RestrictedDriveFolder, DriveData }
