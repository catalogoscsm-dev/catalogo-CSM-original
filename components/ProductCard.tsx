'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Package } from 'lucide-react'
import { Produto } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

interface Props {
  produto: Produto
  favorito?: boolean
  onToggleFavorito?: (id: number) => void
}

export default function ProductCard({ produto, favorito = false, onToggleFavorito }: Props) {
  const [isFav, setIsFav]       = useState(favorito)
  const [copied, setCopied]     = useState(false)
  const [hovered, setHovered]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDark = mounted && theme === 'dark'

  useEffect(() => { setMounted(true) }, [])

  // Reveal via IntersectionObserver — dispara quando o card entra na viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay leve para não revelar tudo de uma vez no carregamento inicial
          setTimeout(() => setRevealed(true), 80)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const img = produto.imagens?.[0] ?? null

  async function toggleFavorito(e: React.MouseEvent) {
    e.preventDefault()
    const res = await fetch('/api/favoritos', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto_id: produto.id }),
    })
    if (res.ok) { setIsFav(!isFav); onToggleFavorito?.(produto.id) }
  }

  async function compartilhar(e: React.MouseEvent) {
    e.preventDefault()
    await navigator.clipboard.writeText(`${window.location.origin}/produto/${produto.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Link href={`/produto/${produto.id}`} className="block group">
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="product-card"
        style={{ transform: hovered ? 'translateY(-3px)' : 'translateY(0)' }}
      >
        {/* Área de imagem */}
        <div className="relative aspect-square overflow-hidden" style={{ background: '#ffffff' }}>

          {img ? (
            <>
              <Image
                src={img}
                alt={produto.nome}
                fill
                className="object-contain transition-transform duration-500"
                style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                onLoad={() => setImgLoaded(true)}
              />

              {/* Skeleton: some quando imagem carrega */}
              {!imgLoaded && (
                <div className="absolute inset-0 z-10 skeleton" />
              )}

              {/* Cortina de reveal: sobe quando card entra na viewport */}
              <div className={`img-curtain ${revealed ? 'revealed' : ''}`} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Package className="w-10 h-10" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
                sem imagem
              </span>
            </div>
          )}

          {/* Ações (hover) */}
          <div
            className="absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-200"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateX(0)' : 'translateX(6px)',
              zIndex: 20,
            }}
          >
            <button onClick={toggleFavorito}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: isFav ? 'rgba(251,113,133,0.15)' : (isDark ? 'rgba(33,33,33,0.95)' : 'rgba(255,255,255,0.95)'),
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                border: isFav ? '1px solid rgba(251,113,133,0.4)' : '1px solid transparent',
              }}>
              <Heart className="w-3.5 h-3.5 transition-all duration-200"
                fill={isFav ? 'currentColor' : 'none'}
                style={{ color: isFav ? '#fb7185' : 'var(--text-secondary)' }} />
            </button>
            <button onClick={compartilhar}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{
                background: isDark ? 'rgba(33,33,33,0.95)' : 'rgba(255,255,255,0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
              <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {copied && (
            <div className="absolute bottom-2 inset-x-2 text-center py-1 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(0,0,0,0.75)', color: '#f1f1f1', zIndex: 20 }}>
              Link copiado!
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="card-title line-clamp-2">
            {produto.nome}
          </h3>
          {produto.dimensoes && (
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {produto.dimensoes.split('|')[0].trim()}
            </p>
          )}
          {produto.acabamento && (
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {produto.acabamento}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
