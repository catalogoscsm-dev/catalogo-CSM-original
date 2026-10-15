'use client'

import { useRef, useEffect, useCallback } from 'react'

const ITEMS = [
  'ALTA MARCENARIA & ESTOFADOS PREMIUM',
  '100+ MARCAS CURADAS',
  'SOFÁS · POLTRONAS · RECAMIERS',
  'CATÁLOGO DIGITAL CSM',
  'DESIGN EXCLUSIVO ASSINADO',
  '5.500+ PRODUTOS',
  'CAMPINAS SHOPPING MÓVEIS',
]
const SEP        = '   ✦   '
const BASE_SPEED = 0.55   // px/frame velocidade normal (esquerda)
const LERP       = 0.045  // fator de suavização da aceleração

function normalise(pos: number, half: number): number {
  let p = pos % half
  if (p > 0) p -= half
  return p
}

export default function MarqueeTicker() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef     = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number | null>(null)

  // Estado da física (mutável sem re-render)
  const pos       = useRef(0)           // posição atual em px
  const vel       = useRef(BASE_SPEED)  // velocidade atual
  const targetVel = useRef(BASE_SPEED)  // velocidade alvo
  const halfW     = useRef(0)           // metade da largura da track (para loop)

  // Estado do arrasto
  const dragging    = useRef(false)
  const dragLastX   = useRef(0)
  const dragLastT   = useRef(0)
  const dragMoment  = useRef(0)   // momentum capturado no fim do drag
  const isHovering  = useRef(false)

  // ─── Calcula halfW uma vez que o DOM esteja pronto ───────────────────────
  const ensureHalf = useCallback(() => {
    if (!halfW.current && trackRef.current) {
      halfW.current = trackRef.current.scrollWidth / 2
    }
    return halfW.current
  }, [])

  // ─── Loop de animação ────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const track = trackRef.current
    const half  = ensureHalf()
    if (track && half > 0 && !dragging.current) {
      vel.current += (targetVel.current - vel.current) * LERP
      pos.current  = normalise(pos.current - vel.current, half)
      track.style.transform = `translateX(${pos.current}px)`
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [ensureHalf])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  // ─── Helpers de drag ─────────────────────────────────────────────────────
  const startDrag = useCallback((x: number) => {
    dragging.current   = true
    dragLastX.current  = x
    dragLastT.current  = performance.now()
    dragMoment.current = 0
    vel.current        = 0
    targetVel.current  = 0
  }, [])

  const moveDrag = useCallback((x: number) => {
    if (!dragging.current) return
    const half = ensureHalf()
    if (!half) return
    const dx  = x - dragLastX.current
    const now = performance.now()
    const dt  = now - dragLastT.current || 1
    // momentum = px/frame @ 60fps
    dragMoment.current = (-dx / dt) * 16.67
    dragLastX.current  = x
    dragLastT.current  = now
    pos.current = normalise(pos.current + dx, half)
    if (trackRef.current) trackRef.current.style.transform = `translateX(${pos.current}px)`
  }, [ensureHalf])

  const endDrag = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    // Aplica momentum do drag, clampado para não ser absurdo
    vel.current = Math.max(-6, Math.min(6, dragMoment.current))
    // Volta suavemente para a velocidade normal (ou 0 se hover)
    targetVel.current = isHovering.current ? 0 : BASE_SPEED
  }, [])

  // ─── Eventos de mouse ────────────────────────────────────────────────────
  const onMouseEnter = useCallback(() => {
    isHovering.current = true
    if (!dragging.current) targetVel.current = 0
  }, [])

  const onMouseLeave = useCallback(() => {
    isHovering.current = false
    if (!dragging.current) targetVel.current = BASE_SPEED
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startDrag(e.clientX)
  }, [startDrag])

  // mouseup global — garante soltar fora do componente
  useEffect(() => {
    const up   = () => endDrag()
    const move = (e: MouseEvent) => moveDrag(e.clientX)
    window.addEventListener('mouseup',   up)
    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mouseup',   up)
      window.removeEventListener('mousemove', move)
    }
  }, [endDrag, moveDrag])

  // ─── Eventos de touch (passive:false para preventDefault) ────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX)
    const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientX) }
    const onTouchEnd   = () => endDrag()
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [startDrag, moveDrag, endDrag])

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{
        background:   'var(--ticker-bg)',
        borderBottom: '1px solid var(--ticker-border)',
        height:       '42px',
        display:      'flex',
        alignItems:   'center',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
    >
      <style>{`
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          user-select: none;
        }
        .ticker-item {
          font-family: var(--n);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.20em;
          color: var(--ticker-text);
          text-transform: uppercase;
          padding: 0 2px;
          text-shadow: var(--ticker-glow);
        }
        .ticker-sep {
          color: var(--ticker-sep);
          font-size: 9px;
          opacity: 0.7;
          text-shadow: var(--ticker-glow);
        }
      `}</style>

      <div ref={trackRef} className="ticker-track">
        {[0, 1].map(copy =>
          ITEMS.map((item, i) => (
            <span key={`${copy}-${i}`} className="ticker-item">
              {item}
              <span className="ticker-sep">{SEP}</span>
            </span>
          ))
        )}
      </div>
    </div>
  )
}
