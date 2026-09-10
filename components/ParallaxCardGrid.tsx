'use client'

import { useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import { Produto } from '@/lib/types'

// Velocidade de parallax por coluna (índice 0-4)
// Colunas pares sobem mais devagar, ímpares mais rápido → cria profundidade em onda
const COL_SPEEDS = [0.12, 0.04, 0.09, 0.04, 0.12]

interface Props {
  produtos: Produto[]
  favorito?: boolean
  onToggleFavorito?: (id: number) => void
}

export default function ParallaxCardGrid({ produtos, favorito, onToggleFavorito }: Props) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    // Descobre quantas colunas existem agora (lê do grid real)
    function getColumns() {
      const first = itemRefs.current.find(Boolean)
      if (!first?.parentElement) return 5
      const style  = getComputedStyle(first.parentElement)
      const cols   = style.gridTemplateColumns.split(' ').length
      return cols || 5
    }

    function tick() {
      const scrollY = window.scrollY
      const cols    = getColumns()

      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const col   = i % cols
        const speed = COL_SPEEDS[col] ?? COL_SPEEDS[0]
        el.style.transform = `translateY(${-scrollY * speed}px)`
      })
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {produtos.map((p, i) => (
        <div
          key={p.id}
          ref={el => { itemRefs.current[i] = el }}
          className="animate-fade-up"
          style={{
            animationDelay: `${i * 0.04}s`,
            opacity: 0,
            willChange: 'transform',
          }}
        >
          <ProductCard produto={p} favorito={favorito} onToggleFavorito={onToggleFavorito} />
        </div>
      ))}
    </div>
  )
}
