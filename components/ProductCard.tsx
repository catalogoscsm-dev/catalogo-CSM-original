'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Package, Link2, X, Mail } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Produto } from '@/lib/types'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'

const WA_PHONE = '5519990034068'

function getProductUrl(id: number) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/produto/${id}`
}
function waProductMsg(nome: string, id: number) {
  const url = getProductUrl(id)
  return encodeURIComponent(
    `Olá! 👋 Vi este produto no Catálogo CSM e tenho interesse:\n\n` +
    `✨ *${nome}*\n\n` +
    `🔗 ${url}\n\n` +
    `Podem me dar mais detalhes? Adoraria saber tudo sobre ele! 😊`
  )
}
function msgShare(nome: string, url: string) {
  return `✨ Olha que achado no Catálogo CSM!\n\n*${nome}*\n\nA *CSM – Campinas Shopping Móveis* tem uma curadoria incrível de móveis e decoração de alto padrão. Vale muito conferir! 🏡\n\n🔗 ${url}`
}
function msgTelegram(nome: string) {
  return `✨ Olha que achado no Catálogo CSM!\n\n${nome}\n\nA CSM – Campinas Shopping Móveis tem uma curadoria incrível de móveis e decoração. Vale conferir! 🏡`
}
function msgEmail(nome: string, url: string) {
  return `Olá!\n\nEncontrei este produto no Catálogo Digital da CSM – Campinas Shopping Móveis e queria compartilhar com você:\n\n${nome}\n\nAcesse o link para ver todos os detalhes:\n${url}\n\nA CSM é referência em móveis e decoração de alto padrão em Campinas. Vale muito a pena conhecer o catálogo completo!\n\nAté mais!`
}
function msgTwitter(nome: string) {
  return `✨ Acabei de encontrar "${nome}" no Catálogo Digital da CSM – Campinas Shopping Móveis! Uma curadoria incrível de móveis e decoração 🏡`
}

const IconWA = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)

const platforms = [
  { id: 'whatsapp',  label: 'WhatsApp',    color: '#25D366', bg: 'rgba(37,211,102,0.12)',  Icon: IconWA },
  { id: 'telegram',  label: 'Telegram',    color: '#229ED9', bg: 'rgba(34,158,217,0.12)',  Icon: IconTelegram },
  { id: 'instagram', label: 'Instagram',   color: '#E1306C', bg: 'rgba(225,48,108,0.12)',  Icon: IconInstagram },
  { id: 'facebook',  label: 'Facebook',    color: '#1877F2', bg: 'rgba(24,119,242,0.12)',  Icon: IconFacebook },
  { id: 'x',         label: 'X / Twitter', color: '#000000', bg: 'rgba(0,0,0,0.10)',       Icon: IconX },
  { id: 'email',     label: 'E-mail',      color: '#EA4335', bg: 'rgba(234,67,53,0.12)',   Icon: Mail },
]

interface Props {
  produto: Produto
  favorito?: boolean
  onToggleFavorito?: (id: number) => void
}

export default function ProductCard({ produto, favorito = false, onToggleFavorito }: Props) {
  const [isFav, setIsFav]         = useState(favorito)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [hovered, setHovered]     = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [revealed, setRevealed]   = useState(false)
  const [imgIdx, setImgIdx]       = useState(0)
  const [fading, setFading]       = useState(false)
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const idxRef                    = useRef(0)

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

  const isMobileDevice = () =>
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    window.innerWidth < 1024

  async function compartilhar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = getProductUrl(produto.id)

    if (isMobileDevice() && navigator.share) {
      try {
        await navigator.share({ title: produto.nome, text: msgShare(produto.nome, url), url })
        return
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === 'AbortError') return
      }
    }
    setSheetOpen(true)
  }

  const handlePlatform = useCallback(async (id: string) => {
    const url = getProductUrl(produto.id)
    let href = ''
    if (id === 'whatsapp')  href = `https://wa.me/?text=${encodeURIComponent(msgShare(produto.nome, url))}`
    if (id === 'telegram')  href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msgTelegram(produto.nome))}`
    if (id === 'facebook')  href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    if (id === 'x')         href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(msgTwitter(produto.nome))}&url=${encodeURIComponent(url)}`
    if (id === 'email')     href = `mailto:?subject=${encodeURIComponent(`${produto.nome} — Catálogo CSM`)}&body=${encodeURIComponent(msgEmail(produto.nome, url))}`
    if (id === 'instagram') {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      window.open('https://www.instagram.com/', '_blank')
      return
    }
    if (href) window.open(href, '_blank')
    setSheetOpen(false)
  }, [produto.id, produto.nome])

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(getProductUrl(produto.id))
    setCopied(true)
    setTimeout(() => { setCopied(false); setSheetOpen(false) }, 1800)
  }, [produto.id])

  return (
    <>
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

      {/* Share Sheet Portal */}
      {sheetOpen && mounted && createPortal(
        <>
          <style>{`
            @keyframes pcSheetUp { from { transform:translateY(100%); opacity:0.4; } to { transform:translateY(0); opacity:1; } }
            @keyframes pcBdIn    { from { opacity:0; } to { opacity:1; } }
            .pc-sheet-up { animation: pcSheetUp 0.38s cubic-bezier(0.32,0,0.15,1) forwards; }
            .pc-bd-in    { animation: pcBdIn    0.25s ease forwards; }
          `}</style>
          <div className="pc-bd-in" onClick={() => setSheetOpen(false)} style={{
            position:'fixed', inset:0, zIndex:9000,
            background:'rgba(0,0,0,0.45)',
            backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
          }} />
          <div className="pc-sheet-up" style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:9001,
            background:'var(--c)',
            borderRadius:'20px 20px 0 0',
            padding:'0 0 calc(env(safe-area-inset-bottom) + 24px)',
            boxShadow:'0 -8px 48px rgba(0,0,0,0.18)',
            maxWidth:520, margin:'0 auto',
          }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
              <div style={{ width:36, height:4, borderRadius:2, background:'var(--h)' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px 16px' }}>
              <div>
                <p style={{ fontWeight:600, fontSize:'0.95rem', color:'var(--f)' }}>Compartilhar</p>
                <p style={{ fontSize:'0.75rem', color:'var(--g)', marginTop:2, maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {produto.nome}
                </p>
              </div>
              <button onClick={() => setSheetOpen(false)} style={{
                width:32, height:32, borderRadius:'50%', border:'none',
                background:'var(--d)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}>
                <X style={{ width:16, height:16, color:'var(--g)' }} />
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px 4px', padding:'0 16px 16px' }}>
              {platforms.map(({ id, label, color, bg, Icon }) => (
                <button key={id} onClick={() => handlePlatform(id)} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                  padding:'14px 8px', borderRadius:16, border:'none', background:bg, cursor:'pointer',
                  transition:'transform 0.15s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform='scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
                >
                  <span style={{ color, display:'flex' }}><Icon /></span>
                  <span style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--f)', letterSpacing:'0.02em' }}>
                    {id === 'instagram' ? (copied ? '✓ Copiado!' : label) : label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ height:1, background:'var(--h)', margin:'0 16px' }} />
            <button onClick={copyLink} style={{
              width:'100%', display:'flex', alignItems:'center', gap:12,
              padding:'16px 24px', border:'none', background:'transparent', cursor:'pointer',
              transition:'background 0.15s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.background='var(--d)')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}
            >
              <div style={{
                width:42, height:42, borderRadius:'50%', background:'var(--d)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                <Link2 style={{ width:18, height:18, color:'var(--f)' }} />
              </div>
              <span style={{ fontSize:'0.85rem', fontWeight:500, color: copied ? '#22c55e' : 'var(--f)' }}>
                {copied ? '✓ Link copiado!' : 'Copiar link'}
              </span>
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
