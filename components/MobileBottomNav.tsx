'use client'

import { Home, Search, Heart, Clock } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const pathname = usePathname()

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

      <Link href="/" className={isHome ? '_mi _a' : '_mi'}>
        <Home className="_mo" />
        <span className="_ml">Início</span>
      </Link>

      <button onClick={handleSearch} className="_mi">
        <Search className="_mo" />
        <span className="_ml">Buscar</span>
      </button>

      <Link href="/favoritos" className={isFav ? '_mi _a' : '_mi'}>
        <Heart className="_mo" />
        <span className="_ml">Favoritos</span>
      </Link>

      <Link href="/favoritos?hist=1" className="_mi">
        <Clock className="_mo" />
        <span className="_ml">Histórico</span>
      </Link>

    </nav>
  )
}
