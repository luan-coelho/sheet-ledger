'use client'

import { Button } from '@/components/ui/button'
import { routes } from '@/lib/routes'
import { Loader2, LogIn } from 'lucide-react'
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
    <div className="space-y-4">
      <Button onClick={handleSignIn} disabled={isLoading} className="w-full h-11" size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Entrar com Google
          </>
        )}
      </Button>

      {callbackUrl !== routes.frontend.admin.sheets && (
        <p className="text-xs text-center text-muted-foreground">
          Você será redirecionado para a página solicitada após o login
        </p>
      )}
    </div>
  )
}
