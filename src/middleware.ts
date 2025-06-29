import { routes } from '@/lib/routes'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Obter o token JWT sem depender da configuração completa do auth
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  // Verificar se o usuário está autenticado
  const isAuthenticated = !!token

  // Permitir acesso às rotas de autenticação
  if (request.nextUrl.pathname.startsWith(routes.frontend.auth.signIn)) {
    if (isAuthenticated) {
      // Se já está autenticado, redirecionar para admin
      return NextResponse.redirect(new URL(routes.frontend.admin.home, request.url))
    }
    return NextResponse.next()
  }

  // Verificar se está tentando acessar rotas protegidas sem autenticação
  if (!isAuthenticated && request.nextUrl.pathname !== routes.frontend.auth.signIn) {
    const signInUrl = new URL(routes.frontend.auth.signIn, request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas as rotas exceto:
     * - api routes (em /api/)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     * - arquivos na pasta public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)+',
  ],
}
