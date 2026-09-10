import { NextResponse } from 'next/server'
import { signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Credenciais invÃ¡lidas' }, { status: 401 })
  }

  const token = await signToken({ username, role: 'admin' })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8h
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}

