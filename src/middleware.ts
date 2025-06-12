import { auth } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default auth(req => {
  // Se não estiver autenticado, redireciona para login
  if (!req.auth) {
    const loginUrl = new URL(routes.frontend.auth.login, req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', encodeURI(req.url))
    return Response.redirect(loginUrl)
  }
})

// Configuração para aplicar o middleware apenas nas rotas administrativas
export const config = {
  matcher: ['/admin/:path*'],
}
