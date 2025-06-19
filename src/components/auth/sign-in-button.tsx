'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

interface SignInButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  callbackUrl?: string
}

export function SignInButton({ variant = 'default', size = 'default', className, callbackUrl }: SignInButtonProps) {
  const searchParams = useSearchParams()
  const defaultCallbackUrl = searchParams.get('callbackUrl') || callbackUrl || '/'

  const handleSignIn = () => {
    signIn('google', { callbackUrl: defaultCallbackUrl })
  }

  return (
    <Button onClick={handleSignIn} variant={variant} size={size} className={className}>
      <LogIn className="mr-2 h-4 w-4" />
      Entrar com Google
    </Button>
  )
}
