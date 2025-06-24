'use client'

import { Button } from '@/components/ui/button'
import { routes } from '@/lib/routes'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || routes.frontend.admin.sheets
  const error = searchParams.get('error')

  // Show error message if there's an authentication error
  if (error) {
    const errorMessages = {
      Configuration: 'Erro de configuração do servidor.',
      AccessDenied: 'Acesso negado. Verifique suas permissões.',
      Verification: 'Token de verificação expirado.',
      Default: 'Erro durante a autenticação. Tente novamente.',
    }

    const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default
    toast.error(errorMessage)
  }

  const handleSignIn = async () => {
    try {
      setIsLoading(true)

      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Erro ao fazer login. Tente novamente.')
      } else if (result?.url) {
        // Redirect to the callback URL or dashboard
        router.push(result.url)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Primary Login Button */}
      <Button 
        onClick={handleSignIn} 
        disabled={isLoading} 
        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg border-0"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continuar com Google</span>
          </>
        )}
      </Button>

      {/* Alternative Login Options */}
      <div className="space-y-4">
        {/* Callback URL Notice */}
        {callbackUrl !== routes.frontend.admin.sheets && (
          <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700 text-center">
              <span className="font-medium">💡 Redirecionamento:</span> Você será direcionado para a página solicitada após o login
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
