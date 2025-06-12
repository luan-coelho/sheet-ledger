'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SignOutButton({ 
  variant = 'ghost', 
  size = 'default',
  className 
}: SignOutButtonProps) {
  return (
    <Button
      onClick={() => signOut()}
      variant={variant}
      size={size}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  )
}
