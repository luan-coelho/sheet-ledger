import { auth } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default auth(req => {
  if (!req.auth && req.nextUrl.pathname !== routes.frontend.auth.signIn) {
    const newUrl = new URL(routes.frontend.auth.signIn, req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
