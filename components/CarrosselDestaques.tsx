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
const CARD_W     = 300
const CARD_H     = 210
const CARD_GAP   = 14

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
      className="mb-10"
      style={{
        /* Full-bleed: sai do container e toca as bordas do viewport */
        width:     '100vw',
        position:  'relative',
        left:      '50%',
        transform: 'translateX(-50%)',
        paddingBlock: '2.25rem 2rem',
        overflow:  'hidden',
      }}
    >
      {/* Label discreta */}
      <p
        className="text-center mb-4"
        style={{
          fontFamily:    'var(--n)',
          fontSize:      '10px',
          fontWeight:    500,
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          color:         'var(--g)',
          opacity:       0.7,
        }}
      >
        ✦&nbsp;&nbsp;Em Destaque&nbsp;&nbsp;·&nbsp;&nbsp;
        <em
          style={{
            fontFamily: 'var(--m)',
            fontStyle:  'italic',
            fontWeight: 400,
            fontSize:   '11px',
            color:      'var(--ticker-text)',
            opacity:    0.85,
            letterSpacing: '.05em',
            textTransform: 'none',
          }}
        >
          Peças que contam a sua história
        </em>
      </p>

      {/* Wrapper com efeito de portal de luz nas bordas */}
      <div className="relative">

        {/* Portal esquerdo — luz que dissolve os cards */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '0 auto 0 0',
          width: '22%', zIndex: 3, pointerEvents: 'none',
          background: 'linear-gradient(to right, var(--a) 0%, var(--a) 18%, transparent 100%)',
        }} />
        {/* Brilho suave laranja no portal esquerdo */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '0 auto 0 0',
          width: '28%', zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 100% at 0% 50%, rgba(184,99,58,0.10) 0%, transparent 100%)',
        }} />

        {/* Portal direito */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '0 0 0 auto',
          width: '22%', zIndex: 3, pointerEvents: 'none',
          background: 'linear-gradient(to left, var(--a) 0%, var(--a) 18%, transparent 100%)',
        }} />
        {/* Brilho suave laranja no portal direito */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '0 0 0 auto',
          width: '28%', zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 100% at 100% 50%, rgba(184,99,58,0.10) 0%, transparent 100%)',
        }} />

        {/* Track arrastável */}
        <div
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          style={{ paddingBlock: '6px' }}
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
              const img      = p.imagens?.[0] ?? null
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
                      background:   'var(--z)',
                      boxShadow:    '0 2px 16px rgba(0,0,0,0.08)',
                      transition:   'filter .4s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 0 7px rgba(184,99,58,0.22))' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none' }}
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

                    {/* Overlay com nome — aparece no hover */}
                    <div
                      className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 30%, rgba(0,0,0,.12) 55%, transparent 80%)',
                        transition: 'opacity .3s ease',
                      }}
                    >
                      {catalogo && (
                        <span style={{
                          fontFamily: 'var(--n)', fontSize: '.56rem', fontWeight: 600,
                          letterSpacing: '.18em', textTransform: 'uppercase',
                          color: 'var(--ticker-text)', marginBottom: '.2rem',
                          textShadow: '0 1px 4px rgba(0,0,0,.6)',
                        }}>
                          {catalogo}
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'var(--m)', fontSize: '1.05rem', fontWeight: 400,
                        color: '#fff', lineHeight: 1.2,
                        textShadow: '0 1px 6px rgba(0,0,0,.7)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {p.nome}
                      </span>
                    </div>
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
