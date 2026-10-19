import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Passa pathname para o layout raiz via header (usado para ocultar nav na tela de login)
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: reqHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
