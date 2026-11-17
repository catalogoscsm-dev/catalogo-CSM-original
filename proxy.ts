import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Block direct access to supplier image folders — served exclusively via /api/img/[hash]
  if (pathname.startsWith('/imagens/')) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
