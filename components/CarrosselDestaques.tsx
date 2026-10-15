'use client'

import { useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Produto } from '@/lib/types'

interface Props {
  produtos: Produto[]
}

const BASE_SPEED = 0.45
const LERP       = 0.045
const CARD_W     = 280
const CARD_H     = 200
const CARD_GAP   = 12

function normalise(pos: number, half: number): number {
  let p = pos % half
  if (p > 0) p -= half
  return p
}

export default function CarrosselDestaques({ produtos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef     = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number | null>(null)

  const pos       = useRef(-1)
  const vel       = useRef(BASE_SPEED)
  const targetVel = useRef(BASE_SPEED)
  const halfW     = useRef(0)

  const dragging   = useRef(false)
  const dragLastX  = useRef(0)
  const dragLastT  = useRef(0)
  const dragMoment = useRef(0)
  const isHovering = useRef(false)

  const ensureHalf = useCallback(() => {
    if (!halfW.current && trackRef.current) {
      halfW.current = trackRef.current.scrollWidth / 2
    }
    return halfW.current
  }, [])

  const tick = useCallback(() => {
    const track = trackRef.current
    const half  = ensureHalf()
    if (track && half > 0 && !dragging.current) {
      vel.current += (targetVel.current - vel.current) * LERP
      pos.current  = normalise(pos.current + vel.current, half)
      track.style.transform = `translateX(${pos.current}px)`
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [ensureHalf])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [tick])

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
    dragMoment.current = (dx / dt) * 16.67
    dragLastX.current  = x
    dragLastT.current  = now
    pos.current = normalise(pos.current + dx, half)
    if (trackRef.current) trackRef.current.style.transform = `translateX(${pos.current}px)`
  }, [ensureHalf])

  const endDrag = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    vel.current = Math.max(-6, Math.min(6, dragMoment.current))
    targetVel.current = isHovering.current ? 0 : BASE_SPEED
  }, [])

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

  if (!produtos.length) return null

  const items = [...produtos, ...produtos]

  return (
    <section
      className="mb-10 -mx-4 sm:-mx-6 lg:-mx-8"
      style={{
        background:   'var(--ticker-bg)',
        paddingBlock: 'clamp(2rem, 5vw, 3.5rem)',
        overflow:     'hidden',
      }}
    >
      {/* ── Cabeçalho ── */}
      <div className="px-6 sm:px-8 lg:px-10 mb-8">
        <p
          className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase mb-3"
          style={{ color: 'var(--ticker-text)' }}
        >
          <span
            style={{
              display:    'inline-block',
              width:      20,
              height:     1.5,
              background: 'var(--ticker-text)',
              flexShrink: 0,
            }}
          />
          Em Destaque
        </p>
        <h2
          style={{
            fontFamily: 'var(--m)',
            fontSize:   'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 300,
            lineHeight: 1.1,
            color:      'var(--f)',
          }}
        >
          Peças que contam<br />
          <em style={{ fontStyle: 'italic', color: 'var(--ticker-text)' }}>a sua história</em>
        </h2>
        <p
          style={{
            fontFamily: 'var(--n)',
            fontSize:   'clamp(.82rem, 1.3vw, .95rem)',
            color:      'var(--g)',
            marginTop:  '.75rem',
            maxWidth:   520,
          }}
        >
          Selecione qualquer peça para explorar detalhes, dimensões e acabamentos.
        </p>
      </div>

      {/* ── Carrossel com fade nas bordas ── */}
      <div className="relative">
        {/* Fade esquerda */}
        <div
          aria-hidden="true"
          style={{
            position:       'absolute',
            inset:          '0 auto 0 0',
            width:          'clamp(3rem, 8vw, 6rem)',
            background:     'linear-gradient(to right, var(--ticker-bg) 10%, transparent)',
            zIndex:         2,
            pointerEvents:  'none',
          }}
        />
        {/* Fade direita */}
        <div
          aria-hidden="true"
          style={{
            position:       'absolute',
            inset:          '0 0 0 auto',
            width:          'clamp(3rem, 8vw, 6rem)',
            background:     'linear-gradient(to left, var(--ticker-bg) 10%, transparent)',
            zIndex:         2,
            pointerEvents:  'none',
          }}
        />

        <div
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ paddingBlock: '.5rem' }}
          onMouseEnter={() => { isHovering.current = true;  if (!dragging.current) targetVel.current = 0 }}
          onMouseLeave={() => { isHovering.current = false; if (!dragging.current) targetVel.current = BASE_SPEED }}
          onMouseDown={e => { e.preventDefault(); startDrag(e.clientX) }}
        >
          <div
            ref={trackRef}
            className="inline-flex"
            style={{ gap: CARD_GAP, willChange: 'transform' }}
          >
            {items.map((p, i) => {
              const img = p.imagens?.[0] ?? null
              const catalogo = (p as { catalogo_nome?: string }).catalogo_nome ?? ''
              return (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/produto/${p.id}`}
                  draggable={false}
                  className="block flex-shrink-0 group"
                  style={{ width: CARD_W }}
                  onClick={e => { if (dragging.current) e.preventDefault() }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width:        CARD_W,
                      height:       CARD_H,
                      borderRadius: '1rem',
                      background:   '#e8e4de',
                    }}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={p.nome}
                        fill
                        unoptimized
                        draggable={false}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center h-full text-xs uppercase tracking-widest"
                        style={{ color: 'var(--g)', opacity: 0.4 }}
                      >
                        sem imagem
                      </div>
                    )}

                    {/* Gradient overlay — aparece no hover */}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.6) 28%, rgba(0,0,0,.18) 55%, transparent 80%)',
                      }}
                    >
                      {catalogo && (
                        <span
                          style={{
                            fontFamily:    'var(--n)',
                            fontSize:      '.58rem',
                            fontWeight:    600,
                            letterSpacing: '.18em',
                            textTransform: 'uppercase',
                            color:         'var(--ticker-text)',
                            textShadow:    '0 1px 4px rgba(0,0,0,.6)',
                            marginBottom:  '.2rem',
                          }}
                        >
                          {catalogo}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--m)',
                          fontSize:   'clamp(.9rem, 1.6vw, 1.1rem)',
                          fontWeight: 400,
                          color:      '#fff',
                          lineHeight: 1.2,
                          textShadow: '0 1px 6px rgba(0,0,0,.7), 0 2px 16px rgba(0,0,0,.4)',
                          display:    '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow:   'hidden',
                        }}
                      >
                        {p.nome}
                      </span>
                    </div>

                    {/* Glow no hover */}
                    <div
                      className="absolute inset-0 rounded-[1rem] transition-all duration-450 opacity-0 group-hover:opacity-100"
                      style={{
                        boxShadow: '0 0 0 1.5px var(--ticker-text), 0 0 20px rgba(184,99,58,.25)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
