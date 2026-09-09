'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Package } from 'lucide-react'

interface Props {
  src: string | null
  alt: string
  thumbnails?: string[]
}

const ZOOM_FACTOR = 3
const PANEL_W = 320
const PANEL_H = 320

export default function ImageZoom({ src, alt, thumbnails = [] }: Props) {
  const [active, setActive] = useState(src)
  const [zooming, setZooming] = useState(false)
  const [lens, setLens] = useState({ x: 0, y: 0 })
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = imageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setLens({ x, y })

    // Posiciona o painel à direita da imagem, alinhado ao topo
    const gap = 16
    let left = rect.right + gap
    let top = rect.top

    // Se não couber na tela, vai para a esquerda
    if (left + PANEL_W > window.innerWidth - 8) {
      left = rect.left - PANEL_W - gap
    }
    // Não sair da tela verticalmente
    if (top + PANEL_H > window.innerHeight - 8) {
      top = window.innerHeight - PANEL_H - 8
    }

    setPanelPos({ top, left })
  }, [])

  const zoomPanel = mounted && active && zooming && createPortal(
    <div
      style={{
        position: 'fixed',
        top: panelPos.top,
        left: panelPos.left,
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: '16px',
        border: '1px solid rgba(184,151,58,0.4)',
        boxShadow: '0 24px 64px rgba(26,23,20,0.2)',
        backgroundImage: `url(${active})`,
        backgroundSize: `${ZOOM_FACTOR * 100}%`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `${lens.x}% ${lens.y}%`,
        backgroundColor: '#FDFCFB',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    />,
    document.body
  )

  return (
    <div className="space-y-3">
      <div
        ref={imageRef}
        className="relative aspect-[4/3] rounded-2xl cursor-crosshair select-none overflow-hidden"
        style={{ background: '#FDFCFB', border: '1px solid var(--border)' }}
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
              priority
            />
            {/* Lente */}
            {zooming && (
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 80,
                  height: 80,
                  left: `${lens.x}%`,
                  top: `${lens.y}%`,
                  transform: 'translate(-50%, -50%)',
                  border: '2px solid rgba(184,151,58,0.7)',
                  background: 'rgba(184,151,58,0.06)',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.02)',
                }}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Package className="w-16 h-16" style={{ color: 'var(--bronze-pale)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--bronze-pale)' }}>
              sem imagem
            </span>
          </div>
        )}
      </div>

      {/* Painel de zoom via portal — flutua por cima de tudo */}
      {zoomPanel}

      {/* Miniaturas */}
      {thumbnails.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(img)}
              className="relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                border: active === img
                  ? '2px solid var(--bronze)'
                  : '2px solid var(--border)',
              }}
            >
              <Image
                src={img}
                alt={`${alt} ${i + 1}`}
                fill
                className={i === 0 ? 'object-contain bg-white' : 'object-cover'}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
