import { SignInForm } from '@/components/auth/sign-in-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          {/* App Branding */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold">Sheet Ledger</h1>
              <p className="text-xs text-muted-foreground">Gestão de Planilhas</p>
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Faça login com sua conta Google para acessar o sistema de gestão de planilhas
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded" />}>
            <SignInForm />
          </Suspense>

          <div className="text-center text-sm text-muted-foreground">
            <p>Sistema seguro e confiável para profissionais de saúde</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
