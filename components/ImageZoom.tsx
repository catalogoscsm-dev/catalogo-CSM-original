'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Package, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  src: string | null
  alt: string
  thumbnails?: string[]
  fullHeight?: boolean
}

const ZOOM_FACTOR = 5
const PANEL_W = 340
const PANEL_H = 340
const DBL_TAP_MS = 280
const SWIPE_THRESHOLD = 50
const IMG_PAD_FULL = 6   // padding do <Image> no modo fullHeight
const IMG_PAD_GRID = 0

type Nat = { w: number; h: number }
type Draw = { x: number; y: number; w: number; h: number }
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// Retângulo real da foto dentro do contêiner (object-fit: contain, centralizada, com padding)
function drawnRect(rect: DOMRect, nat: Nat, pad: number): Draw {
  const W = rect.width - 2 * pad, H = rect.height - 2 * pad
  const s = Math.min(W / nat.w, H / nat.h)
  const w = nat.w * s, h = nat.h * s
  return { x: pad + (W - w) / 2, y: pad + (H - h) / 2, w, h }
}

export default function ImageZoom({ src, alt, thumbnails = [], fullHeight = false }: Props) {
  const [active, setActive]             = useState(src)
  const [zooming, setZooming]           = useState(false)
  const [lens, setLens]                 = useState({ x: 0, y: 0 })   // px dentro do contêiner (círculo)
  const [view, setView]                 = useState({ fx: 0.5, fy: 0.5, w: 1, h: 1 })  // ponto na foto (0–1) e tamanho exibido
  const [nat, setNat]                   = useState<Nat | null>(null)  // tamanho natural da imagem ativa
  const [panelPos, setPanelPos]         = useState({ top: 0, left: 0 })
  const [mounted, setMounted]           = useState(false)
  const [isMobileDevice, setIsMobile]   = useState(false)

  // Lightbox state
  const [lbOpen, setLbOpen]         = useState(false)
  const [lbIndex, setLbIndex]       = useState(0)
  const [lbScale, setLbScale]       = useState(1)
  const [lbTranslate, setLbTranslate] = useState({ x: 0, y: 0 })

  // Lightbox touch refs
  const lbTouchX    = useRef<number | null>(null)
  const lbLastTap   = useRef(0)
  const lbMulti     = useRef(false)
  const lbDragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  const imageRef = useRef<HTMLDivElement>(null)

  const selectImage = (img: string) => { if (img !== active) { setNat(null); setZooming(false); setActive(img) } }
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget
    if (t.naturalWidth && t.naturalHeight) setNat({ w: t.naturalWidth, h: t.naturalHeight })
  }

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Sync active image index when lightbox opens
  const openLightbox = useCallback(() => {
    const idx = thumbnails.findIndex(u => u === active)
    setLbIndex(idx >= 0 ? idx : 0)
    setLbScale(1)
    setLbTranslate({ x: 0, y: 0 })
    setLbOpen(true)
  }, [active, thumbnails])

  // Lightbox navigation
  const lbPrev = () => { setLbIndex(i => Math.max(0, i - 1)); setLbScale(1); setLbTranslate({ x: 0, y: 0 }) }
  const lbNext = () => { setLbIndex(i => Math.min(thumbnails.length - 1, i + 1)); setLbScale(1); setLbTranslate({ x: 0, y: 0 }) }

  // Lightbox touch handlers
  const lbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length > 1) { lbMulti.current = true; lbTouchX.current = null; lbDragStart.current = null; return }
    lbMulti.current = false
    const t = e.touches[0]
    lbTouchX.current = t.clientX
    if (lbScale > 1) {
      lbDragStart.current = { x: t.clientX, y: t.clientY, tx: lbTranslate.x, ty: lbTranslate.y }
    }
  }
  const lbTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length > 1) { lbMulti.current = true; lbTouchX.current = null; lbDragStart.current = null; return }
    if (lbScale > 1 && lbDragStart.current) {
      e.preventDefault()
      const t = e.touches[0]
      setLbTranslate({
        x: lbDragStart.current.tx + (t.clientX - lbDragStart.current.x),
        y: lbDragStart.current.ty + (t.clientY - lbDragStart.current.y),
      })
    }
  }
  const lbTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()

    // Double-tap to toggle zoom
    const now = Date.now()
    if (now - lbLastTap.current < DBL_TAP_MS) {
      setLbScale(s => { const next = s > 1 ? 1 : 4; if (next === 1) setLbTranslate({ x: 0, y: 0 }); return next })
      lbLastTap.current = 0
      lbTouchX.current = null
      lbDragStart.current = null
      return
    }
    lbLastTap.current = now

    lbDragStart.current = null

    // Swipe only when not zoomed and single touch
    if (lbTouchX.current === null || lbMulti.current || lbScale > 1) {
      lbTouchX.current = null; lbMulti.current = false; return
    }
    const dx = e.changedTouches[0].clientX - lbTouchX.current
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dx < 0 ? lbNext() : lbPrev()
    }
    lbTouchX.current = null
    lbMulti.current = false
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = imageRef.current
    if (!el || !nat) { setZooming(false); return }          // sem dimensões naturais: sem lupa
    const rect = el.getBoundingClientRect()
    const d = drawnRect(rect, nat, fullHeight ? IMG_PAD_FULL : IMG_PAD_GRID)
    const px = e.clientX - rect.left, py = e.clientY - rect.top
    const inside = px >= d.x && px <= d.x + d.w && py >= d.y && py <= d.y + d.h
    if (!inside) { setZooming(false); return }              // cursor nas faixas do contain: esconde
    setZooming(true)
    setLens({ x: px, y: py })
    setView({ fx: clamp01((px - d.x) / d.w), fy: clamp01((py - d.y) / d.h), w: d.w, h: d.h })
    const gap = 16
    let left = rect.right + gap
    let top  = rect.top
    if (left + PANEL_W > window.innerWidth - 8)  left = rect.left - PANEL_W - gap
    if (top  + PANEL_H > window.innerHeight - 8) top  = window.innerHeight - PANEL_H - 8
    setPanelPos({ top, left })
  }, [nat, fullHeight])

  // Desktop zoom panel
  const zoomPanel = mounted && active && nat && zooming && createPortal(
    <div style={{
      position: 'fixed', top: panelPos.top, left: panelPos.left,
      width: PANEL_W, height: PANEL_H, borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      backgroundImage: `url('${active}')`,
      backgroundSize: `${view.w * ZOOM_FACTOR}px ${view.h * ZOOM_FACTOR}px`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${PANEL_W / 2 - view.fx * view.w * ZOOM_FACTOR}px ${PANEL_H / 2 - view.fy * view.h * ZOOM_FACTOR}px`,
      backgroundColor: '#ffffff',
      pointerEvents: 'none', zIndex: 9999, overflow: 'hidden',
    }} />,
    document.body
  )

  // Lightbox portal
  const lbSrc = thumbnails.length > 0 ? thumbnails[lbIndex] : active
  const lightboxPortal = mounted && lbOpen && createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        touchAction: lbScale > 1 ? 'none' : 'pan-y',
      }}
      onTouchStart={lbTouchStart}
      onTouchMove={lbTouchMove}
      onTouchEnd={lbTouchEnd}
      onClick={() => setLbOpen(false)}
    >
      {/* Imagem com zoom */}
      {lbSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lbSrc}
          alt={alt}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '100%',
            maxHeight: '90dvh',
            objectFit: 'contain',
            userSelect: 'none',
            borderRadius: 8,
            transform: `translate(${lbTranslate.x}px, ${lbTranslate.y}px) scale(${lbScale})`,
            transition: lbDragStart.current ? 'none' : 'transform 0.22s ease',
            touchAction: 'none',
          }}
        />
      )}

      {/* Seta esquerda */}
      {thumbnails.length > 1 && lbIndex > 0 && (
        <button
          onClick={e => { e.stopPropagation(); lbPrev() }}
          style={{
            position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 9999,
          }}
          aria-label="Foto anterior"
        >
          <ChevronLeft style={{ width: 22, height: 22 }} />
        </button>
      )}

      {/* Seta direita */}
      {thumbnails.length > 1 && lbIndex < thumbnails.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); lbNext() }}
          style={{
            position: 'fixed', right: 14, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 9999,
          }}
          aria-label="Próxima foto"
        >
          <ChevronRight style={{ width: 22, height: 22 }} />
        </button>
      )}

      {/* Contador de fotos */}
      {thumbnails.length > 1 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.15)', borderRadius: 20,
          padding: '4px 14px', color: '#fff', fontSize: 13, zIndex: 9999,
        }}>
          {lbIndex + 1} / {thumbnails.length}
        </div>
      )}

      {/* Dica de duplo toque (mobile) */}
      {isMobileDevice && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.12)', borderRadius: 16,
          padding: '4px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 11, zIndex: 9999,
          pointerEvents: 'none',
        }}>
          Duplo toque para zoom · Arraste para navegar
        </div>
      )}

      {/* Botão fechar */}
      <button
        onClick={() => setLbOpen(false)}
        style={{
          position: 'fixed', top: 16, right: 16,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', fontSize: 20, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 9999,
        }}
        aria-label="Fechar"
      >×</button>
    </div>,
    document.body
  )

  if (fullHeight) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>

        {/* Imagem principal */}
        <div
          ref={imageRef}
          style={{
            flex: 1, position: 'relative',
            cursor: active ? (isMobileDevice ? 'zoom-in' : 'crosshair') : 'default',
            overflow: 'hidden', minHeight: '200px',
          }}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={e => !isMobileDevice && active && handleMouseMove(e)}
          onClick={() => isMobileDevice && active && openLightbox()}
        >
          {active ? (
            <>
              <Image
                src={active} alt={alt} fill
                className="object-contain pointer-events-none _pi-img"
                style={{ padding: IMG_PAD_FULL }}
                priority
                onLoad={onImgLoad}
              />
              {zooming && (
                <div style={{
                  position: 'absolute', width: PANEL_W / ZOOM_FACTOR, height: PANEL_H / ZOOM_FACTOR,
                  left: lens.x, top: lens.y,
                  transform: 'translate(-50%, -50%)',
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '50%', pointerEvents: 'none',
                }} />
              )}
              {isMobileDevice && !zooming && (
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'rgba(0,0,0,0.35)', borderRadius: 6,
                  padding: '4px 6px', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <ZoomIn style={{ width: 14, height: 14, color: '#fff' }} />
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>Toque para ampliar</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <Package style={{ width: 48, height: 48, color: '#ccc' }} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ccc' }}>
                sem imagem
              </span>
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {thumbnails.length > 1 && (
          <div style={{
            display: 'flex', gap: 8, padding: '12px 16px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            overflowX: 'auto', background: '#ffffff',
          }}>
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => selectImage(img)}
                style={{
                  flexShrink: 0, width: 56, height: 56, borderRadius: 8,
                  overflow: 'hidden',
                  border: active === img ? '2px solid #1a1a1a' : '2px solid transparent',
                  opacity: active === img ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  position: 'relative', background: '#ffffff', cursor: 'pointer',
                }}
              >
                <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain" style={{ padding: 4 }} />
              </button>
            ))}
          </div>
        )}

        {zoomPanel}
        {lightboxPortal}
      </div>
    )
  }

  // ── Modo padrão (grid normal) ──
  return (
    <div className="space-y-3">
      <div
        ref={imageRef}
        className="relative aspect-[4/3] rounded-2xl cursor-crosshair select-none overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid var(--h)' }}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={e => active && handleMouseMove(e)}
      >
        {active ? (
          <>
            <Image src={active} alt={alt} fill className="object-contain pointer-events-none" priority onLoad={onImgLoad} />
            {zooming && (
              <div style={{
                position: 'absolute', width: PANEL_W / ZOOM_FACTOR, height: PANEL_H / ZOOM_FACTOR,
                left: lens.x, top: lens.y,
                transform: 'translate(-50%, -50%)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(1px)',
                borderRadius: '50%', pointerEvents: 'none',
              }} />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Package className="w-16 h-16" style={{ color: 'var(--g)', opacity: 0.3 }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--g)', opacity: 0.4 }}>
              sem imagem
            </span>
          </div>
        )}
      </div>

      {zoomPanel}

      {thumbnails.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={() => selectImage(img)}
              className="relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                border: active === img ? '2px solid var(--f)' : '2px solid var(--h)',
                opacity: active === img ? 1 : 0.6,
                background: '#fff',
              }}
            >
              <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain" style={{ padding: 4 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
