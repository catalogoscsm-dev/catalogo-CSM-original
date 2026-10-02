'use client'

import { Search, X, Heart, Sun, Moon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'

export default function SearchToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue]   = useState(searchParams.get('q') ?? '')
  const [mounted, setMounted] = useState(false)
  const { theme, toggle }   = useTheme()
  const isDark = mounted && theme === 'dark'
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setValue(searchParams.get('q') ?? '') }, [searchParams])
  useEffect(() => { setMounted(true) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    value.trim() ? params.set('q', value.trim()) : params.delete('q')
    router.push(`/?${params.toString()}`)
  }

  function handleToggle() {
    const rect = btnRef.current?.getBoundingClientRect()
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined
    toggle(origin)
  }

  return (
    <>
      <style>{`
        @keyframes k10 {
          0%   { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          60%  { transform: rotate(15deg)   scale(1.15); opacity: 1; }
          100% { transform: rotate(0deg)    scale(1);    opacity: 1; }
        }
        ._ts { animation: k10 0.5s cubic-bezier(.34,1.56,.64,1) forwards; display: flex; }
      `}</style>

      <div className="_t sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2.5">

            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--g)' }} />
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Buscar produtos, acabamentos, dimensões..."
                className="_q w-full pl-10 pr-10 py-2 text-sm rounded-lg outline-none transition-all duration-200"
              />
              {value && (
                <button type="button" onClick={() => { setValue(''); router.push('/') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--g)' }} />
                </button>
              )}
            </form>

            <div className="flex items-center gap-1.5">
              <button
                ref={btnRef}
                onClick={handleToggle}
                className="_b w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                title={isDark ? 'Modo claro' : 'Modo escuro'}
              >
                {mounted && (
                  <span key={theme} className="_ts">
                    {isDark
                      ? <Sun  className="w-4 h-4" style={{ color: '#C8C4BE' }} />
                      : <Moon className="w-4 h-4" style={{ color: '#6B6460' }} />}
                  </span>
                )}
              </button>

              <Link
                href="/favoritos"
                className="_b w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Favoritos"
              >
                <Heart className="w-4 h-4" style={{ color: 'var(--g)' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
