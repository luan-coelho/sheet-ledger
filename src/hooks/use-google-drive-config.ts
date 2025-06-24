import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Tipos para as configurações
export interface GoogleDriveConfigStatus {
  isConfigured: boolean
  accountEmail?: string
  configuredAt?: Date
}

export interface GoogleDriveAuthUrl {
  authUrl: string
}

export interface GoogleDriveConfigData {
  accountEmail: string
  configuredAt: Date
}

// Chaves das queries
const QUERY_KEYS = {
  status: ['google-drive-config', 'status'] as const,
  authUrl: ['google-drive-config', 'auth-url'] as const,
}

// Hook para obter status da configuração
export function useGoogleDriveConfigStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.status,
    queryFn: async (): Promise<GoogleDriveConfigStatus> => {
      const response = await fetch('/api/google-drive-config')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao obter status')
      }
      
      return data.data
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  })
}

// Hook para obter URL de autorização
export function useGoogleDriveAuthUrl() {
  return useQuery({
    queryKey: QUERY_KEYS.authUrl,
    queryFn: async (): Promise<GoogleDriveAuthUrl> => {
      const response = await fetch('/api/google-drive-config/auth-url')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao obter URL de autorização')
      }
      
      return data.data
    },
    enabled: false, // Só executa quando chamado manualmente
  })
}

// Hook para configurar Google Drive
export function useConfigureGoogleDrive() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (code: string): Promise<GoogleDriveConfigData> => {
      const response = await fetch('/api/google-drive-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao configurar Google Drive')
      }
      
      return data.data
    },
    onSuccess: (data) => {
      // Invalidar cache do status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status })
      
      toast.success(`Google Drive configurado com sucesso! Conta: ${data.accountEmail}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao configurar Google Drive')
    },
  })
}

// Hook para remover configuração
export function useRemoveGoogleDriveConfig() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch('/api/google-drive-config', {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erro ao remover configuração')
      }
    },
    onSuccess: () => {
      // Invalidar cache do status
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status })
      
      toast.success('Configuração do Google Drive removida com sucesso')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover configuração')
    },
  })
}

// Hook para iniciar processo de autorização
export function useStartGoogleDriveAuth() {
  const { refetch: getAuthUrl } = useGoogleDriveAuthUrl()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { data } = await getAuthUrl()
      
      if (data?.authUrl) {
        // Abrir nova janela para autorização
        const width = 500
        const height = 600
        const left = (window.screen.width / 2) - (width / 2)
        const top = (window.screen.height / 2) - (height / 2)
        
        const authWindow = window.open(
          data.authUrl,
          'google-drive-auth',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        )
        
        // Monitorar quando a janela for fechada
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed)
            // Atualizar status após fechar janela
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.status })
            }, 1000)
          }
        }, 1000)
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar autorização')
    },
  })
} 