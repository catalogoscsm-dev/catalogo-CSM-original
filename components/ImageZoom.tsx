'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Package } from 'lucide-react'

interface Props {
  src: string | null
  alt: string
  thumbnails?: string[]
  fullHeight?: boolean  // modo split-screen: preenche 100% do container pai
}

const ZOOM_FACTOR = 3
const PANEL_W = 340
const PANEL_H = 340

export default function ImageZoom({ src, alt, thumbnails = [], fullHeight = false }: Props) {
  const [active, setActive]       = useState(src)
  const [zooming, setZooming]     = useState(false)
  const [lens, setLens]           = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos]   = useState({ top: 0, left: 0 })
  const [mounted, setMounted]     = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

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

  const zoomPanel = mounted && active && zooming && createPortal(
    <div style={{
      position: 'fixed',
      top: panelPos.top,
      left: panelPos.left,
      width: PANEL_W,
      height: PANEL_H,
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      backgroundImage: `url(${active})`,
      backgroundSize: `${ZOOM_FACTOR * 100}%`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${lens.x}% ${lens.y}%`,
      backgroundColor: '#ffffff',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }} />,
    document.body
  )

  if (fullHeight) {
    // ── Modo split-screen: imagem preenche 100% do painel sticky ──
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Imagem principal — flex-1 */}
        <div
          ref={imageRef}
          style={{
            flex: 1,
            position: 'relative',
            cursor: active ? 'crosshair' : 'default',
            overflow: 'hidden',
            minHeight: 0,
          }}
          onMouseEnter={() => active && setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {active ? (
            <>
              <Image
                src={active}
                alt={alt}
                fill
                className="object-contain pointer-events-none"
                style={{ padding: '6px' }}
                priority
              />
              {zooming && (
                <div style={{
                  position: 'absolute',
                  width: 88,
                  height: 88,
                  left: `${lens.x}%`,
                  top: `${lens.y}%`,
                  transform: 'translate(-50%, -50%)',
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
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

        {/* Miniaturas na base do painel */}
        {thumbnails.length > 1 && (
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '12px 16px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            overflowX: 'auto',
            background: '#fafaf9',
          }}>
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(img)}
                style={{
                  flexShrink: 0,
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: active === img ? '2px solid #1a1a1a' : '2px solid transparent',
                  opacity: active === img ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-contain" style={{ padding: 4 }} />
              </button>
            ))}
          </div>
        )}

        {zoomPanel}
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
                position: 'absolute',
                width: 80,
                height: 80,
                left: `${lens.x}%`,
                top: `${lens.y}%`,
                transform: 'translate(-50%, -50%)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(1px)',
                borderRadius: '50%',
                pointerEvents: 'none',
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
