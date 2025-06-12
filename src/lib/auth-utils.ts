import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server-side authentication guard for pages
 * Redirects to sign-in page if user is not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return session
}

/**
 * Server-side authentication check without redirect
 * Returns session or null
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Check if user has specific permissions (for future role-based access)
 */
export function hasPermission(session: any, _permission: string): boolean {
  // For now, all authenticated users have all permissions
  // This can be extended later for role-based access control
  return !!session?.user
}

/**
 * Generate callback URL for post-login redirect
 */
export function getCallbackUrl(pathname: string, searchParams?: string): string {
  const baseUrl = pathname
  const params = searchParams ? `?${searchParams}` : ''
  return encodeURIComponent(baseUrl + params)
}
