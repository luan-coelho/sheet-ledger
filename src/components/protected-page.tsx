'use client'

import { useRequireAuth } from '@/hooks/use-auth-guard'
import { Loader2 } from 'lucide-react'

interface ProtectedPageProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client-side page protection wrapper
 * Shows loading state while checking authentication
 * Redirects to sign-in if not authenticated
 */
export function ProtectedPage({ children, fallback }: ProtectedPageProps) {
  const { isLoading, isAuthenticated } = useRequireAuth()

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Verificando autenticação...</span>
          </div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    // The hook will handle the redirect
    return null
  }

  return <>{children}</>
}
