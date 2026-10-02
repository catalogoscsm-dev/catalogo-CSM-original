'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Package } from 'lucide-react'

const WA_PHONE = '5519990034068'
function waProductMsg(nome: string, id: number) {
  if (typeof window === 'undefined') return ''
  const url = `${window.location.origin}/produto/${id}`
  return encodeURIComponent(
    `Olá! 👋 Vi este produto no Catálogo CSM e tenho interesse:\n\n` +
    `✨ *${nome}*\n\n` +
    `🔗 ${url}\n\n` +
    `Podem me dar mais detalhes? Adoraria saber tudo sobre ele! 😊`
  )
}
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
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)
  const idxRef                  = useRef(0)

  const cardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isDark = mounted && theme === 'dark'
  const imgs = produto.imagens ?? []

  useEffect(() => {
    setMounted(true)
    if (!favorito) {
      const favs: number[] = JSON.parse(localStorage.getItem('csm_favoritos') ?? '[]')
      setIsFav(favs.includes(produto.id))
    }
  }, [produto.id, favorito])

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

  // Pré-carrega todas as imagens ao entrar no hover
  // Usa fetch direto pois Next.js Image transforma a URL e o preload via new Image() não funcionaria
  useEffect(() => {
    if (!hovered || imgs.length <= 1) return
    imgs.slice(1).forEach(src => { fetch(src).catch(() => {}) })
  }, [hovered]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ciclo de imagens no hover
  useEffect(() => {
    if (!hovered || imgs.length <= 1) return
    idxRef.current = 0

    intervalRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % imgs.length
        setImgIdx(idxRef.current)
        setTimeout(() => setFading(false), 80) // aguarda imagem estar pronta
      }, 320) // tempo suficiente para o fade-out de 300ms completar
    }, 2200)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [hovered, imgs.length])

  // Reset ao sair
  useEffect(() => {
    if (!hovered) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setFading(true)
      setTimeout(() => { setImgIdx(0); idxRef.current = 0; setFading(false) }, 300)
    }
  }, [hovered])

  const img = imgs[imgIdx] ?? null

  function toggleFavorito(e: React.MouseEvent) {
    e.preventDefault()
    const LS_KEY = 'csm_favoritos'
    const favs: number[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
    const next = isFav ? favs.filter(id => id !== produto.id) : [...favs, produto.id]
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    setIsFav(!isFav)
    onToggleFavorito?.(produto.id)
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
        className="_p"
        style={{ transform: hovered ? 'translateY(-3px)' : 'translateY(0)' }}
      >
        {/* Área de imagem */}
        <div className="relative aspect-square overflow-hidden" style={{ background: '#ffffff' }}>

          {/* Badge NEW */}
          {produto.catalogo_pasta === 'Aco Mobilia 2025-7' && (
            <div style={{
              position: 'absolute', top: 8, left: 8, zIndex: 25,
              background: '#D4A017', color: '#fff',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
              padding: '3px 7px', borderRadius: 4,
              textTransform: 'uppercase',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}>
              NEW
            </div>
          )}

          {img ? (
            <>
              <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.32s ease', position: 'absolute', inset: 0 }}>
                <Image
                  key={imgIdx}
                  src={img}
                  alt={produto.nome}
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-500"
                  style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', padding: '4px' }}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>

              {/* Skeleton: some quando imagem carrega */}
              {!imgLoaded && (
                <div className="absolute inset-0 z-10 _s" />
              )}

              {/* Cortina de reveal: sobe quando card entra na viewport */}
              <div className={`_c ${revealed ? '_r' : ''}`} />

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
              <Package className="w-10 h-10" style={{ color: 'var(--g)', opacity: 0.4 }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--g)', opacity: 0.4 }}>
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
                style={{ color: isFav ? '#fb7185' : 'var(--g)' }} />
            </button>
            <button onClick={compartilhar}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{
                background: isDark ? 'rgba(33,33,33,0.95)' : 'rgba(255,255,255,0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
              <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--g)' }} />
            </button>
            <a
              href={`https://wa.me/${WA_PHONE}?text=${waProductMsg(produto.nome, produto.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{
                background: '#25D366',
                boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
              }}
              title="Perguntar sobre este produto"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
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
          <h3 className="_ct line-clamp-2">
            {produto.nome}
          </h3>
          {produto.dimensoes && (
            <p className="text-xs truncate" style={{ color: 'var(--g)' }}>
              {produto.dimensoes.split('|')[0].trim()}
            </p>
          )}
          {produto.acabamento && (
            <p className="text-xs truncate" style={{ color: 'var(--g)' }}>
              {produto.acabamento}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
