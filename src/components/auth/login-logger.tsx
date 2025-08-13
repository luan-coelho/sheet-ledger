'use client'

import { logSuccessfulSignIn } from '@/actions/auth-actions'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

/**
 * Componente para detectar e registrar logs de login bem-sucedido
 * Deve ser incluído no layout principal para funcionar em todas as páginas
 */
export function LoginLogger() {
  const { data: session, status } = useSession()
  const hasLoggedRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Só processar quando status não estiver loading
    if (status === 'loading') return

    // Se não há sessão, resetar refs
    if (status === 'unauthenticated' || !session?.user?.id) {
      hasLoggedRef.current = false
      sessionIdRef.current = null
      return
    }

    // Se há sessão autenticada
    if (status === 'authenticated' && session?.user?.id) {
      const currentSessionId = session.user.id
      const storageKey = `login-logged-${currentSessionId}`

      // Verificar se é uma nova sessão (diferente da anterior)
      const isNewSession = sessionIdRef.current !== currentSessionId

      // Verificar se já foi logado nesta sessão (usando sessionStorage)
      const hasLoggedInStorage = typeof window !== 'undefined' && sessionStorage.getItem(storageKey) === 'true'

      // Só registrar log se:
      // 1. É uma nova sessão OU ainda não foi logado nesta sessão
      // 2. Não foi registrado pelo componente atual (hasLoggedRef)
      // 3. Não foi registrado no sessionStorage
      if ((isNewSession || !hasLoggedRef.current) && !hasLoggedInStorage) {
        hasLoggedRef.current = true
        sessionIdRef.current = currentSessionId

        // Marcar como logado no sessionStorage para evitar duplicatas
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(storageKey, 'true')
        }

        // Registrar log de login bem-sucedido
        logSuccessfulSignIn().catch(error => {
          console.error('Erro ao registrar log de login:', error)
          // Em caso de erro, remover marca do sessionStorage para tentar novamente
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(storageKey)
          }
          hasLoggedRef.current = false
        })
      }
    }
  }, [session, status])

  // Componente não renderiza nada visualmente
  return null
}
