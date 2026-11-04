import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('csm_admin')
  return res
}
