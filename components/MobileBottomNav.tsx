'use client'

import { Home, Search, Heart, Clock } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getFavKey, useVendedor } from '@/lib/useVendedor'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const vendedora = useVendedor()
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    function syncFavCount() {
      try {
        const ids: number[] = JSON.parse(localStorage.getItem(getFavKey()) ?? '[]')
        setFavCount(ids.length)
      } catch { setFavCount(0) }
    }
    syncFavCount()
    window.addEventListener('csm:favoritos-updated', syncFavCount)
    window.addEventListener('storage', syncFavCount)
    return () => {
      window.removeEventListener('csm:favoritos-updated', syncFavCount)
      window.removeEventListener('storage', syncFavCount)
    }
  }, [])

  function handleSearch() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('._q')?.focus()
    }, 350)
  }

  const isHome = pathname === '/'
  const isFav  = pathname.startsWith('/favoritos') && !pathname.includes('hist')

  return (
    <nav className="_mn">

      <Link href={vendedora ? `/?v=${vendedora.codigo}` : '/'} className={isHome ? '_mi _a' : '_mi'}>
        <Home className="_mo" />
        <span className="_ml">Início</span>
      </Link>

      <button onClick={handleSearch} className="_mi">
        <Search className="_mo" />
        <span className="_ml">Buscar</span>
      </button>

      <Link href="/favoritos" className={isFav ? '_mi _a' : '_mi'} style={{ position: 'relative' }}>
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Heart
            className="_mo"
            fill={favCount > 0 ? '#fb7185' : 'none'}
            style={{
              color: favCount > 0 ? '#fb7185' : undefined,
              filter: favCount > 0 ? 'drop-shadow(0 0 4px rgba(251,113,133,0.5))' : 'none',
              transition: 'color 0.3s ease, filter 0.3s ease',
            }}
          />
          {favCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              minWidth: '14px',
              height: '14px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              lineHeight: '14px',
              textAlign: 'center',
              padding: '0 3px',
              boxShadow: '0 1px 6px rgba(244,63,94,0.5)',
              pointerEvents: 'none',
            }}>
              {favCount > 99 ? '99+' : favCount}
            </span>
          )}
        </span>
        <span className="_ml">Favoritos</span>
      </Link>

      <Link href="/favoritos?hist=1" className="_mi">
        <Clock className="_mo" />
        <span className="_ml">Histórico</span>
      </Link>

    </nav>
  )
}
