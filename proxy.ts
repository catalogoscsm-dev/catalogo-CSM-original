import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rotas públicas — não exigem autenticação
  const isPublic =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/logout') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/imagens') ||
    pathname === '/favicon.ico'

  // Passa pathname para o layout via header
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-pathname', pathname)
  const next = () => NextResponse.next({ request: { headers: reqHeaders } })

  if (isPublic) return next()

  const token = req.cookies.get('csm_admin')?.value
  const secret = process.env.ADMIN_SECRET ?? ''

  if (!token || token !== secret) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
