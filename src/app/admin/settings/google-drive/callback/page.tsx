'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Copy } from 'lucide-react'
import { useConfigureGoogleDrive } from '@/hooks/use-google-drive-config'

function GoogleDriveCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [authCode, setAuthCode] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const configureGoogleDrive = useConfigureGoogleDrive()

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setStatus('error')
      setError(errorParam === 'access_denied' ? 'Acesso negado pelo usuário' : `Erro: ${errorParam}`)
      return
    }

    if (code && authCode !== code) {
      setAuthCode(code)

      // Tentar configurar automaticamente apenas uma vez
      configureGoogleDrive.mutate(code, {
        onSuccess: () => {
          setStatus('success')
          // Fechar janela após sucesso
          setTimeout(() => {
            window.close()
          }, 2000)
        },
        onError: error => {
          setStatus('error')
          const errorMessage = error instanceof Error ? error.message : 'Erro ao configurar'

          // Se for erro de código inválido, dar instruções específicas
          if (errorMessage.includes('invalid_grant')) {
            setError('Código de autorização expirado ou já usado. Feche esta janela e tente novamente.')
          } else {
            setError(errorMessage)
          }
        },
      })
    } else if (!code) {
      setStatus('error')
      setError('Código de autorização não encontrado')
    }
  }, [searchParams, configureGoogleDrive, authCode])

  function handleCopyCode() {
    navigator.clipboard.writeText(authCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCloseWindow() {
    window.close()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            Google Drive - Autorização
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processando autorização...'}
            {status === 'success' && 'Configuração concluída com sucesso!'}
            {status === 'error' && 'Ocorreu um erro na autorização'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Configurando acesso ao Google Drive...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-3">
              <p className="text-sm text-green-600">✅ Google Drive configurado com sucesso!</p>
              <p className="text-xs text-muted-foreground">Esta janela será fechada automaticamente...</p>
              <Button onClick={handleCloseWindow} className="w-full">
                Fechar Janela
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">❌ {error}</p>
              </div>

              {authCode && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Código de autorização (para configuração manual):</p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">{authCode}</div>
                    <Button size="sm" variant="outline" onClick={handleCopyCode} className="flex items-center gap-1">
                      <Copy className="h-3 w-3" />
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Copie este código e cole na página de configurações.</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCloseWindow} variant="outline" className="flex-1">
                  Fechar
                </Button>
                {authCode && (
                  <Button
                    onClick={() => configureGoogleDrive.mutate(authCode)}
                    disabled={configureGoogleDrive.isPending}
                    className="flex-1">
                    {configureGoogleDrive.isPending ? 'Tentando...' : 'Tentar Novamente'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function GoogleDriveCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Google Drive - Autorização
              </CardTitle>
              <CardDescription>Carregando...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Processando autorização...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }>
      <GoogleDriveCallbackContent />
    </Suspense>
  )
}
