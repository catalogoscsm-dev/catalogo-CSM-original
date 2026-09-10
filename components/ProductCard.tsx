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
  const [imgIdx, setImgIdx]     = useState(0)
  const [fading, setFading]     = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDark = mounted && theme === 'dark'
  const imgs = produto.imagens ?? []

  useEffect(() => { setMounted(true) }, [])

  // Reveal via IntersectionObserver — dispara quando o card entra na viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealed(true), 80)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Ciclo de imagens no hover
  useEffect(() => {
    if (!hovered || imgs.length <= 1) return
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setImgIdx(i => (i + 1) % imgs.length)
        setFading(false)
      }, 180)
    }, 950)
    return () => clearInterval(interval)
  }, [hovered, imgs.length])

  // Reset ao sair
  useEffect(() => {
    if (!hovered) { setImgIdx(0); setFading(false) }
  }, [hovered])

  const img = imgs[imgIdx] ?? null

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
              <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.18s ease', position: 'absolute', inset: 0 }}>
                <Image
                  src={img}
                  alt={produto.nome}
                  fill
                  className="object-contain transition-transform duration-500"
                  style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>

              {/* Skeleton: some quando imagem carrega */}
              {!imgLoaded && (
                <div className="absolute inset-0 z-10 skeleton" />
              )}

              {/* Cortina de reveal: sobe quando card entra na viewport */}
              <div className={`img-curtain ${revealed ? 'revealed' : ''}`} />

              {/* Dots indicadores de múltiplas imagens */}
              {imgs.length > 1 && (
                <div
                  className="absolute bottom-2 inset-x-0 flex justify-center gap-1 transition-opacity duration-200"
                  style={{ opacity: hovered ? 1 : 0.5, zIndex: 15 }}
                >
                  {imgs.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === imgIdx ? 14 : 5,
                        height: 5,
                        borderRadius: 3,
                        background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}
                    />
                  ))}
                </div>
              )}
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
