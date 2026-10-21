import { NextRequest, NextResponse } from 'next/server'

const SESSION_MAX_AGE = 60 * 60 * 8 // 8 horas

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secret = process.env.ADMIN_SECRET ?? ''
  const token  = req.cookies.get('csm_admin')?.value

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token || token !== secret) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Sessão válida — renova expiração deslizante de 8h
  if (token && token === secret) {
    const res = NextResponse.next()
    res.cookies.set('csm_admin', secret, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    })
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
