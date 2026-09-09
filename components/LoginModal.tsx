'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Lock } from 'lucide-react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { onClose(); router.refresh() }
    else { const d = await res.json(); setError(d.error ?? 'Credenciais inválidas') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,23,20,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl p-8 space-y-6 animate-scale-in"
        style={{ background: '#FDFCFB', boxShadow: '0 32px 80px rgba(26,23,20,0.25)' }}>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--charcoal)' }}>
              Área Administrativa
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Acesso restrito a colaboradores</p>
          </div>
          <button onClick={onClose} className="transition-all duration-200 hover:rotate-90 hover:scale-110">
            <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Divisor */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, var(--bronze-pale), transparent)' }} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {['username', 'password'].map(field => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                {field === 'username' ? 'Usuário' : 'Senha'}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                required
                autoFocus={field === 'username'}
                value={form[field as 'username' | 'password']}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  color: 'var(--charcoal)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--bronze-light)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,151,58,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                placeholder={field === 'username' ? 'seu usuário' : '••••••••'}
              />
            </div>
          ))}

          {error && (
            <p className="text-xs px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', color: '#dc2626' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1A1714, #8C6E18)', color: '#FFFFFF' }}>
            <Lock className="w-4 h-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
