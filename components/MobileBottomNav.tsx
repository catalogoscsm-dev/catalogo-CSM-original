'use client'

import { Home, Search, Heart, Clock } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const pathname = usePathname()

  function handleSearch() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus()
    }, 350)
  }

  const isHome = pathname === '/'
  const isFav  = pathname.startsWith('/favoritos') && !pathname.includes('hist')

  return (
    <nav className="mobile-bottom-nav">

      <Link href="/" className={isHome ? 'mob-nav-item active' : 'mob-nav-item'}>
        <Home className="mob-nav-icon" />
        <span className="mob-nav-label">Início</span>
      </Link>

      <button onClick={handleSearch} className="mob-nav-item">
        <Search className="mob-nav-icon" />
        <span className="mob-nav-label">Buscar</span>
      </button>

      <Link href="/favoritos" className={isFav ? 'mob-nav-item active' : 'mob-nav-item'}>
        <Heart className="mob-nav-icon" />
        <span className="mob-nav-label">Favoritos</span>
      </Link>

      <Link href="/favoritos?hist=1" className="mob-nav-item">
        <Clock className="mob-nav-icon" />
        <span className="mob-nav-label">Histórico</span>
      </Link>

    </nav>
  )
}
