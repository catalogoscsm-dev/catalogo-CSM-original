'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)

  useEffect(() => { setValue(searchParams.get('q') ?? '') }, [searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    value.trim() ? params.set('q', value.trim()) : params.delete('q')
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative transition-all duration-300" style={{
        borderRadius: '16px',
        boxShadow: focused
          ? '0 0 0 2px rgba(184,151,58,0.4), 0 8px 32px rgba(26,23,20,0.15)'
          : '0 4px 20px rgba(26,23,20,0.10)',
      }}>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200"
          style={{ color: focused ? 'var(--bronze)' : 'var(--muted)' }} />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Buscar produtos, acabamentos, dimensões..."
          className="w-full pl-14 pr-14 py-4 text-sm outline-none rounded-2xl transition-all duration-300"
          style={{
            background: 'rgba(253,252,251,0.95)',
            color: 'var(--charcoal)',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {value && (
          <button type="button" onClick={() => { setValue(''); router.push('/') }}
            className="absolute right-5 top-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110">
            <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
        )}
      </div>
    </form>
  )
}
