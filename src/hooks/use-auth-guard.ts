'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { routes } from '@/lib/routes'

interface UseAuthGuardOptions {
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

/**
 * Client-side authentication guard hook
 * Redirects users based on authentication status
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const { redirectTo = routes.frontend.auth.signIn, redirectIfAuthenticated = false } = options

  useEffect(() => {
    if (status === 'loading') return // Still loading

    const isAuthenticated = !!session

    if (redirectIfAuthenticated && isAuthenticated) {
      // Redirect authenticated users away from auth pages
      router.push(routes.frontend.admin.home)
      return
    }

    if (!redirectIfAuthenticated && !isAuthenticated) {
      // Redirect unauthenticated users to sign-in
      const callbackUrl = encodeURIComponent(pathname)
      const signInUrl = `${redirectTo}?callbackUrl=${callbackUrl}`
      router.push(signInUrl)
      return
    }
  }, [session, status, router, pathname, redirectTo, redirectIfAuthenticated])

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  }
}

/**
 * Hook for protecting pages that require authentication
 */
export function useRequireAuth() {
  return useAuthGuard()
}

/**
 * Hook for auth pages that should redirect authenticated users
 */
export function useRedirectIfAuthenticated() {
  return useAuthGuard({ redirectIfAuthenticated: true })
}
