import { NextRequest, NextResponse } from 'next/server'

// Exclui esta rota do export estático (GitHub Pages) — cliente recebe 404 e usa fallback cookie
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('csm_admin')
  const secret = process.env.ADMIN_SECRET ?? ''
  if (secret && cookie?.value === secret) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
