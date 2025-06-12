import { SignInButton } from '@/components/auth/sign-in-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Entrar no Sheet Ledger
          </CardTitle>
          <CardDescription className="text-center">
            Faça login com sua conta Google para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SignInButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
