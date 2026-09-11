'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  prevId: number | null
  nextId: number | null
  children: React.ReactNode
}

const DIR_KEY = 'csm_nav_dir'

export default function ProductNavAnimated({ prevId, nextId, children }: Props) {
  const router  = useRouter()
  const [phase, setPhase]       = useState<'entering' | 'idle' | 'exiting'>('entering')
  const [exitDir, setExitDir]   = useState<'left' | 'right'>('left')
  const [enterDir, setEnterDir] = useState<'left' | 'right'>('left')
  const [scrollY, setScrollY]   = useState(0)
  const [hoverL, setHoverL]     = useState(false)
  const [hoverR, setHoverR]     = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const touchX   = useRef<number | null>(null)
  const touchY   = useRef<number | null>(null)
  const busy     = useRef(false)

  /* ── Enter animation ── */
  useEffect(() => {
    const dir = (sessionStorage.getItem(DIR_KEY) as 'left' | 'right') ?? 'left'
    sessionStorage.removeItem(DIR_KEY)
    setEnterDir(dir)
    setPhase('entering')
    const t = setTimeout(() => setPhase('idle'), 520)
    return () => clearTimeout(t)
  }, [])

  /* ── Mobile detection ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Scroll parallax ── */
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Navigate ── */
  const go = useCallback((dir: 'left' | 'right', id: number) => {
    if (busy.current) return
    busy.current = true
    sessionStorage.setItem(DIR_KEY, dir)
    setExitDir(dir)
    setPhase('exiting')
    setTimeout(() => router.push(`/produto/${id}`), 420)
  }, [router])

  const prev = () => prevId && go('right', prevId)
  const next = () => nextId && go('left',  nextId)

  /* ── Keyboard ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [prevId, nextId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Swipe ── */
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = Math.abs(e.changedTouches[0].clientY - (touchY.current ?? 0))
    if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.2) {
      dx > 0 ? prev() : next()
    }
    touchX.current = null
  }

  /* ── Content animation ── */
  const contentAnim: React.CSSProperties =
    phase === 'entering'
      ? { animation: `pn-enter-${enterDir === 'left' ? 'r' : 'l'} 0.52s cubic-bezier(0.22,1,0.36,1) both` }
      : phase === 'exiting'
      ? { animation: `pn-exit-${exitDir} 0.4s cubic-bezier(0.55,0,1,0.45) both`,  pointerEvents: 'none' }
      : {}

  /* ── Parallax offset for arrows ── */
  const parallax = scrollY * 0.06

  /* ── Arrow style helper ── */
  const arrowStyle = (side: 'l' | 'r', hovered: boolean): React.CSSProperties => ({
    position:       'fixed',
    top:            isMobile
      ? 'calc(144px + 37.5vw)'
      : `calc(50vh + ${parallax}px)`,
    [side === 'l' ? 'left' : 'right']: 14,
    transform:      'translateY(-50%)',
    zIndex:         100,
    width:          hovered ? 56 : 48,
    height:         hovered ? 56 : 48,
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    cursor:         'pointer',
    border:         'none',
    outline:        'none',
    background:     hovered
      ? 'rgba(255,255,255,0.22)'
      : 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow:      hovered
      ? '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.3)'
      : '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.15)',
    color:          'var(--text-primary)',
    animation:      hovered ? 'none' : `pn-float 3.2s ease-in-out infinite`,
    transition:     'width 0.2s ease, height 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
    willChange:     'transform',
  })

  return (
    <>
      <style>{`
        @keyframes pn-enter-r {
          from { opacity:0; transform:translateX(70px) scale(0.97); }
          to   { opacity:1; transform:translateX(0)    scale(1);    }
        }
        @keyframes pn-enter-l {
          from { opacity:0; transform:translateX(-70px) scale(0.97); }
          to   { opacity:1; transform:translateX(0)     scale(1);    }
        }
        @keyframes pn-exit-left {
          from { opacity:1; transform:translateX(0)    scale(1);    }
          to   { opacity:0; transform:translateX(-90px) scale(0.96); }
        }
        @keyframes pn-exit-right {
          from { opacity:1; transform:translateX(0)   scale(1);    }
          to   { opacity:0; transform:translateX(90px) scale(0.96); }
        }
        @keyframes pn-float {
          0%,100% { transform:translateY(-50%) translateY(0px);   }
          50%      { transform:translateY(-50%) translateY(-7px);  }
        }
        @keyframes pn-ripple {
          0%   { box-shadow:0 0 0 0 rgba(255,255,255,0.25); }
          100% { box-shadow:0 0 0 18px rgba(255,255,255,0); }
        }
      `}</style>

      <div
        style={contentAnim}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>

      {/* ── Seta esquerda ── */}
      {prevId && (
        <button
          onClick={prev}
          onMouseEnter={() => setHoverL(true)}
          onMouseLeave={() => setHoverL(false)}
          style={{
            ...arrowStyle('l', hoverL),
            animation: hoverL ? 'pn-ripple 0.6s ease-out' : 'pn-float 3.2s ease-in-out infinite',
          }}
          aria-label="Produto anterior"
        >
          <ChevronLeft
            style={{
              width:      hoverL ? 26 : 22,
              height:     hoverL ? 26 : 22,
              transition: 'width 0.2s, height 0.2s',
              strokeWidth: 2,
            }}
          />
        </button>
      )}

      {/* ── Seta direita ── */}
      {nextId && (
        <button
          onClick={next}
          onMouseEnter={() => setHoverR(true)}
          onMouseLeave={() => setHoverR(false)}
          style={{
            ...arrowStyle('r', hoverR),
            animation: hoverR ? 'pn-ripple 0.6s ease-out' : `pn-float 3.2s ease-in-out infinite 0.4s`,
          }}
          aria-label="Próximo produto"
        >
          <ChevronRight
            style={{
              width:      hoverR ? 26 : 22,
              height:     hoverR ? 26 : 22,
              transition: 'width 0.2s, height 0.2s',
              strokeWidth: 2,
            }}
          />
        </button>
      )}
    </>
  )
}
