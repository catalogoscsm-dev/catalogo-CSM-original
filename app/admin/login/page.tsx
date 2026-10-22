'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

// Hash SHA-256 da senha — lido de variável de ambiente, nunca hardcoded
const PWD_SHA256 = process.env.NEXT_PUBLIC_ADMIN_HASH ?? ''

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function setAdminCookie() {
  // Cookie de UI separado do httpOnly do servidor (não sobrescreve o seguro)
  const maxAge = 60 * 60 * 24 * 30
  document.cookie = `csm_admin_ui=1; path=/; max-age=${maxAge}; SameSite=Strict`
}

function LoginContent() {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Tenta API (funciona no Vercel)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAdminCookie()
        router.push(next)
        router.refresh()
        return
      }
      if (res.status !== 404) {
        setError('Senha incorreta.')
        setLoading(false)
        return
      }
    } catch {
      // API indisponível (GitHub Pages) — cai no fallback abaixo
    }

    // Fallback cliente (GitHub Pages): verifica SHA-256 da senha
    const hash = await sha256(password)
    if (hash === PWD_SHA256) {
      setAdminCookie()
      router.push(next)
      router.refresh()
    } else {
      setError('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{ background: 'var(--c)', border: '1px solid var(--h)' }}>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--j)', opacity: 0.9 }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="_fd text-xl font-medium" style={{ color: 'var(--f)' }}>
            Acesso Vendedor
          </h1>
          <p className="text-sm" style={{ color: 'var(--g)' }}>
            Área restrita — CSM
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              autoFocus
              className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none"
              style={{
                background: 'var(--b)',
                border: '1px solid var(--h)',
                color: 'var(--f)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              style={{ color: 'var(--g)' }}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: '#e05' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: 'var(--j)', color: '#fff' }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
