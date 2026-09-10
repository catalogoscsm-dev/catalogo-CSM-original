'use client'

import { useEffect, useRef } from 'react'

interface Blob {
  top: string
  left: string
  width: number
  color: string
  speed: number
  blur: number
}

const BLOBS: Blob[] = [
  { top: '-5%',  left: '55%',  width: 600, color: 'rgba(251,113,133,0.12)', speed: 0.18, blur: 100 },
  { top: '25%',  left: '-5%',  width: 500, color: 'rgba(99,102,241,0.10)',  speed: 0.10, blur: 90  },
  { top: '60%',  left: '65%',  width: 400, color: 'rgba(20,184,166,0.09)',  speed: 0.22, blur: 80  },
  { top: '75%',  left: '25%',  width: 450, color: 'rgba(251,113,133,0.08)', speed: 0.07, blur: 110 },
  { top: '10%',  left: '20%',  width: 300, color: 'rgba(139,92,246,0.07)',  speed: 0.14, blur: 85  },
]

export default function ParallaxBackground() {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const raf  = useRef<number>(0)

  useEffect(() => {
    function tick() {
      const y = window.scrollY
      refs.current.forEach((el, i) => {
        if (!el) return
        el.style.transform = `translateY(${y * BLOBS[i].speed}px)`
      })
    }

    function onScroll() {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {BLOBS.map((b, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.width,
            height: b.width,
            borderRadius: '50%',
            background: b.color,
            filter: `blur(${b.blur}px)`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
