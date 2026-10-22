import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('csm_admin')
  const secret = process.env.ADMIN_SECRET ?? ''
  if (secret && cookie?.value === secret) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
