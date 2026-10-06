import { NextRequest, NextResponse } from 'next/server'
import { scryptSync, timingSafeEqual } from 'crypto'

// In-memory rate limiter: ip → { count, blockedUntil }
const attempts = new Map<string, { count: number; blockedUntil: number }>()

const MAX_ATTEMPTS = 5
const BLOCK_MS = 15 * 60 * 1000 // 15 minutos

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const derived = scryptSync(password, salt, 64)
    const storedBuf = Buffer.from(hash, 'hex')
    return timingSafeEqual(derived, storedBuf)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const now = Date.now()
  const record = attempts.get(ip) ?? { count: 0, blockedUntil: 0 }

  if (record.blockedUntil > now) {
    const mins = Math.ceil((record.blockedUntil - now) / 60000)
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${mins} min.` },
      { status: 429 }
    )
  }

  const { password } = await req.json()
  const hash = process.env.ADMIN_PASSWORD_HASH ?? ''
  const valid = !!(password && hash && verifyPassword(password, hash))

  if (!valid) {
    const count = record.count + 1
    attempts.set(ip, {
      count,
      blockedUntil: count >= MAX_ATTEMPTS ? now + BLOCK_MS : 0,
    })
    const restantes = MAX_ATTEMPTS - count
    const msg = restantes > 0
      ? `Senha incorreta. ${restantes} tentativa(s) restante(s).`
      : 'Conta bloqueada por 15 minutos.'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  attempts.delete(ip)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('csm_admin', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
