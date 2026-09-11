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

const ZOOM_FACTOR = 3
const PANEL_W = 340
const PANEL_H = 340
const DBL_TAP_MS = 280
const SWIPE_THRESHOLD = 50

export default function ImageZoom({ src, alt, thumbnails = [], fullHeight = false }: Props) {
  const [active, setActive]             = useState(src)
  const [zooming, setZooming]           = useState(false)
  const [lens, setLens]                 = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos]         = useState({ top: 0, left: 0 })
  const [mounted, setMounted]           = useState(false)
  const [isMobileDevice, setIsMobile]   = useState(false)

  // Lightbox state
  const [lbOpen, setLbOpen]   = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const [lbScale, setLbScale] = useState(1)

  // Lightbox touch refs
  const lbTouchX    = useRef<number | null>(null)
  const lbLastTap   = useRef(0)
  const lbMulti     = useRef(false)

  const imageRef = useRef<HTMLDivElement>(null)

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
    setLbOpen(true)
  }, [active, thumbnails])

  // Lightbox navigation
  const lbPrev = () => { setLbIndex(i => Math.max(0, i - 1)); setLbScale(1) }
  const lbNext = () => { setLbIndex(i => Math.min(thumbnails.length - 1, i + 1)); setLbScale(1) }

  // Lightbox touch handlers
  const lbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length > 1) { lbMulti.current = true; lbTouchX.current = null; return }
    lbMulti.current = false
    lbTouchX.current = e.touches[0].clientX
  }
  const lbTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (e.touches.length > 1) { lbMulti.current = true; lbTouchX.current = null }
  }
  const lbTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()

    // Double-tap to toggle zoom (2.5×)
    const now = Date.now()
    if (now - lbLastTap.current < DBL_TAP_MS) {
      setLbScale(s => s > 1 ? 1 : 2.5)
      lbLastTap.current = 0
      lbTouchX.current = null
      return
    }
    lbLastTap.current = now

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
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setLens({ x, y })
    const gap = 16
    let left = rect.right + gap
    let top  = rect.top
    if (left + PANEL_W > window.innerWidth - 8)  left = rect.left - PANEL_W - gap
    if (top  + PANEL_H > window.innerHeight - 8) top  = window.innerHeight - PANEL_H - 8
    setPanelPos({ top, left })
  }, [])

  // Desktop zoom panel
  const zoomPanel = mounted && active && zooming && createPortal(
    <div style={{
      position: 'fixed', top: panelPos.top, left: panelPos.left,
      width: PANEL_W, height: PANEL_H, borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      backgroundImage: `url(${active})`,
      backgroundSize: `${ZOOM_FACTOR * 100}%`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${lens.x}% ${lens.y}%`,
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
        touchAction: lbScale > 1 ? 'pinch-zoom' : 'pan-y',
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
            transform: `scale(${lbScale})`,
            transition: 'transform 0.22s ease',
            touchAction: lbScale > 1 ? 'pinch-zoom' : 'none',
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
            overflow: 'hidden', minHeight: 0,
          }}
          onMouseEnter={() => !isMobileDevice && active && setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
          onClick={() => isMobileDevice && active && openLightbox()}
        >
          {active ? (
            <>
              <Image
                src={active} alt={alt} fill
                className="object-contain pointer-events-none"
                style={{ padding: '6px' }}
                priority
              />
              {zooming && (
                <div style={{
                  position: 'absolute', width: 88, height: 88,
                  left: `${lens.x}%`, top: `${lens.y}%`,
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
            overflowX: 'auto', background: '#fafaf9',
          }}>
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(img)}
                style={{
                  flexShrink: 0, width: 56, height: 56, borderRadius: 8,
                  overflow: 'hidden',
                  border: active === img ? '2px solid #1a1a1a' : '2px solid transparent',
                  opacity: active === img ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  position: 'relative', background: '#fff', cursor: 'pointer',
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
        style={{ background: '#ffffff', border: '1px solid var(--border)' }}
        onMouseEnter={() => active && setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {active ? (
          <>
            <Image src={active} alt={alt} fill className="object-contain pointer-events-none" priority />
            {zooming && (
              <div style={{
                position: 'absolute', width: 80, height: 80,
                left: `${lens.x}%`, top: `${lens.y}%`,
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
            <Package className="w-16 h-16" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>
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
              onClick={() => setActive(img)}
              className="relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                border: active === img ? '2px solid var(--text-primary)' : '2px solid var(--border)',
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
