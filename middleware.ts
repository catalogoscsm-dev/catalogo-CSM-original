import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — não precisam de autenticação
  const isPublic =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/logout') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/imagens') ||
    pathname === '/favicon.ico'

  if (isPublic) return NextResponse.next()

  const cookie = request.cookies.get('csm_admin')?.value
  const secret = process.env.ADMIN_SECRET

  if (!secret || cookie !== secret) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
