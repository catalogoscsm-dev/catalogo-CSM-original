'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Package } from 'lucide-react'
import { Produto } from '@/lib/types'
import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

interface Props {
  produto: Produto
  favorito?: boolean
  onToggleFavorito?: (id: number) => void
}

export default function ProductCard({ produto, favorito = false, onToggleFavorito }: Props) {
  const [isFav, setIsFav] = useState(favorito)
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = mounted && theme === 'dark'

  useEffect(() => { setMounted(true) }, [])

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

  // cores do card baseadas no tema
  const cardBg = isDark
    ? hovered ? '#201C14' : '#17140F'
    : hovered ? '#FDFCFB' : '#FAFAF9'

  const cardBorder = isDark
    ? hovered ? 'rgba(184,151,58,0.5)' : 'rgba(44,39,25,0.9)'
    : hovered ? 'rgba(184,151,58,0.5)' : 'rgba(232,226,218,0.8)'

  const cardShadow = isDark
    ? hovered
      ? '0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(184,151,58,0.12), inset 0 1px 0 rgba(255,240,200,0.04)'
      : '0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,200,0.03)'
    : hovered
      ? '0 20px 60px rgba(26,23,20,0.12), 0 4px 16px rgba(139,107,71,0.08)'
      : '0 2px 12px rgba(26,23,20,0.04)'

  const imgBg = '#FDFCFB'
  const actionBg = isDark ? 'rgba(28,29,36,0.95)' : 'rgba(253,252,251,0.95)'

  return (
    <Link href={`/produto/${produto.id}`} className="block group">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* fio dourado no topo (dark only) */}
        {isDark && (
          <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(184,151,58,0.2) 50%, transparent 90%)' }} />
        )}

        {/* Imagem */}
        <div className="relative aspect-square overflow-hidden" style={{ background: imgBg }}>
          {img ? (
            <Image
              src={img}
              alt={produto.nome}
              fill
              className="object-contain transition-transform duration-700"
              style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', padding: '8px' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Package className="w-10 h-10" style={{ color: 'var(--bronze-pale)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--bronze-pale)' }}>sem imagem</span>
            </div>
          )}

          {/* Ações */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 transition-all duration-300"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(8px)' }}>
            <button onClick={toggleFavorito}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: isFav ? '#8C6E18' : actionBg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>
              <Heart className="w-3.5 h-3.5" fill={isFav ? 'white' : 'none'}
                style={{ color: isFav ? 'white' : 'var(--bronze)' }} />
            </button>
            <button onClick={compartilhar}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: actionBg, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
              <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--bronze)' }} />
            </button>
          </div>

          {copied && (
            <div className="absolute bottom-2 inset-x-2 text-center py-1 rounded-lg text-xs font-medium"
              style={{ background: 'var(--charcoal)', color: '#FDFCFB' }}>
              Link copiado!
            </div>
          )}

          {/* dissolução branco → card escuro (dark only) */}
          {isDark && (
            <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{ background: `linear-gradient(to bottom, transparent 0%, ${cardBg} 100%)` }} />
          )}

          {/* linha âmbar inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, #8C6E18, transparent)',
              opacity: hovered ? 1 : 0,
            }} />
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-colors duration-200"
            style={{ color: hovered ? 'var(--bronze)' : 'var(--charcoal)', fontFamily: "'Playfair Display', serif" }}>
            {produto.nome}
          </h3>
          {produto.dimensoes && (
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {produto.dimensoes.split('|')[0].trim()}
            </p>
          )}
          {produto.acabamento && (
            <p className="text-xs truncate" style={{ color: 'var(--bronze-light)' }}>
              {produto.acabamento}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
