'use client'

import { Search, X, Heart, Sun, Moon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'

export default function SearchToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggle } = useTheme()
  const isDark = mounted && theme === 'dark'

  useEffect(() => { setValue(searchParams.get('q') ?? '') }, [searchParams])
  useEffect(() => { setMounted(true) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    value.trim() ? params.set('q', value.trim()) : params.delete('q')
    router.push(`/?${params.toString()}`)
  }

  function handleToggle() {
    setSpinning(true)
    toggle()
    setTimeout(() => setSpinning(false), 600)
  }

  return (
    <>
      <style>{`
        @keyframes spin-in {
          0%   { transform: rotate(-180deg) scale(0.4); opacity: 0; }
          60%  { transform: rotate(20deg) scale(1.2); opacity: 1; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes burst {
          0%   { box-shadow: 0 0 0 0 rgba(184,151,58,0); }
          40%  { box-shadow: 0 0 0 8px rgba(184,151,58,0.25); }
          100% { box-shadow: 0 0 0 16px rgba(184,151,58,0); }
        }
        .theme-icon-spin { animation: spin-in 0.55s cubic-bezier(.34,1.56,.64,1) forwards; }
        .theme-btn-burst { animation: burst 0.55s ease-out forwards; }
      `}</style>

      <div className="sticky top-16 z-30 border-b" style={{
        background: isDark ? 'rgba(13,11,8,0.97)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderColor: isDark ? 'rgba(44,39,25,0.8)' : 'var(--border)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">

            {/* Barra de pesquisa */}
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: focused ? 'var(--bronze)' : 'var(--muted)' }} />
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Buscar produtos, acabamentos, dimensões..."
                className="w-full pl-11 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
                style={{
                  background: isDark ? '#17140F' : '#F7F4F0',
                  color: 'var(--charcoal)',
                  border: `1px solid ${focused ? 'var(--bronze)' : isDark ? 'rgba(44,39,25,0.9)' : 'var(--border)'}`,
                  boxShadow: focused ? '0 0 0 3px rgba(184,151,58,0.15)' : 'none',
                }}
              />
              {value && (
                <button type="button" onClick={() => { setValue(''); router.push('/') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                </button>
              )}
            </form>

            {/* Botões */}
            <div className="flex items-center gap-1.5">

              {/* Light / Dark */}
              <button
                onClick={handleToggle}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${spinning ? 'theme-btn-burst' : ''}`}
                style={{
                  background: isDark ? '#17140F' : '#F7F4F0',
                  border: `1px solid ${isDark ? 'rgba(44,39,25,0.9)' : 'var(--border)'}`,
                }}
                title={isDark ? 'Modo claro' : 'Modo escuro'}
              >
                <span key={theme} className="theme-icon-spin flex items-center justify-center">
                  {isDark
                    ? <Sun className="w-4 h-4" style={{ color: '#B8973A' }} />
                    : <Moon className="w-4 h-4" style={{ color: '#8A8480' }} />}
                </span>
              </button>

              {/* Favoritos */}
              <Link
                href="/favoritos"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: isDark ? '#17140F' : '#F7F4F0',
                  border: `1px solid ${isDark ? 'rgba(44,39,25,0.9)' : 'var(--border)'}`,
                }}
                title="Favoritos"
              >
                <Heart className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
