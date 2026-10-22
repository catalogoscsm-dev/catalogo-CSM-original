'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useEffect, useState, useCallback } from 'react'
import { Search, X, Heart, Sun, Moon, Lock, LockOpen } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Spark {
  id: number
  x: number
  y: number
  size: number
  duration: number
  drift: number
}

export default function Header() {
  const pathname     = usePathname()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggle } = useTheme()

  // ── Logo effects ─────────────────────────────────────────────────────────
  const shellRef              = useRef<HTMLDivElement>(null)
  const [shimmering, setShimmering] = useState(false)
  const [sparks, setSparks]   = useState<Spark[]>([])
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const fire = () => { setShimmering(true); setTimeout(() => setShimmering(false), 1700) }
    const t0 = setTimeout(fire, 1800)
    const iv = setInterval(fire, 6000)
    return () => { clearTimeout(t0); clearInterval(iv) }
  }, [])

  useEffect(() => {
    const spawn = () => {
      const id = Date.now() + Math.random()
      const spark: Spark = {
        id,
        x:        8  + Math.random() * 84,
        y:        15 + Math.random() * 70,
        size:     1.5 + Math.random() * 2.5,
        duration: 1.6 + Math.random() * 1.4,
        drift:    (Math.random() - 0.5) * 28,
      }
      setSparks(prev => [...prev.slice(-5), spark])
      setTimeout(() => setSparks(prev => prev.filter(s => s.id !== id)), 3200)
    }
    const t0 = setTimeout(spawn, 2800)
    const iv = setInterval(spawn, 2200)
    return () => { clearTimeout(t0); clearInterval(iv) }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = shellRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
    setTilt({ x: dy * -7, y: dx * 7 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }, [])

  // ── Search ────────────────────────────────────────────────────────────────
  const [value, setValue]   = useState(searchParams.get('q') ?? '')
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setValue(searchParams.get('q') ?? '') }, [searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    value.trim() ? params.set('q', value.trim()) : params.delete('q')
    router.push(`/?${params.toString()}`)
  }

  function handleToggle() {
    const rect = btnRef.current?.getBoundingClientRect()
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined
    toggle(origin)
  }

  const isDark = mounted && theme === 'dark'

  // ── Admin toggle ──────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const check = () => setIsAdmin(document.cookie.includes('csm_admin_ui=1'))
    check()
    window.addEventListener('csm-admin-change', check)
    return () => window.removeEventListener('csm-admin-change', check)
  }, [])

  function toggleAdmin() {
    if (isAdmin) {
      document.cookie = 'csm_admin_ui=; path=/; max-age=0'
    } else {
      document.cookie = 'csm_admin_ui=1; path=/; max-age=86400; SameSite=Strict'
    }
    window.dispatchEvent(new CustomEvent('csm-admin-change'))
  }

  return (
    <header className="_h sticky top-0 z-40">
      <style>{`
        @keyframes logo-enter {
          from { opacity: 0; transform: translateX(-18px) scale(0.93); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50%       { transform: scale(1.013) translateY(-1.5px); }
        }
        @keyframes logo-shimmer {
          0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(240%)  skewX(-18deg); opacity: 0; }
        }
        @keyframes logo-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.06); }
        }
        @keyframes spark-rise {
          0%   { opacity: 0;   transform: translate(0, 0)        scale(0); }
          15%  { opacity: 1;   transform: translate(0, -4px)     scale(1); }
          80%  { opacity: 0.8; }
          100% { opacity: 0;   transform: translate(var(--drift), -32px) scale(0.3); }
        }
        @keyframes k10 {
          0%   { transform: rotate(-180deg) scale(0.5); opacity: 0; }
          60%  { transform: rotate(15deg)   scale(1.15); opacity: 1; }
          100% { transform: rotate(0deg)    scale(1);    opacity: 1; }
        }
        .logo-shell {
          position: relative;
          display: inline-flex;
          border-radius: 6px;
          animation: logo-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both;
          cursor: pointer;
          flex-shrink: 0;
        }
        .logo-img {
          display: block;
          position: relative;
          z-index: 2;
          will-change: transform;
          user-select: none;
          -webkit-user-drag: none;
          animation: logo-breathe 5.5s ease-in-out infinite;
        }
        .logo-shell.is-hovered .logo-img {
          animation: none;
          filter: drop-shadow(0 6px 20px rgba(140,110,24,0.4)) brightness(1.06);
        }
        .logo-glow {
          position: absolute;
          inset: -20px -28px;
          background: radial-gradient(ellipse 70% 55% at 50% 60%, rgba(140,110,24,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: logo-glow 3.8s ease-in-out infinite;
        }
        .logo-shimmer-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 4px;
          pointer-events: none;
          z-index: 3;
        }
        .logo-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(108deg, transparent 20%, rgba(255,218,100,0.18) 43%, rgba(255,248,190,0.58) 50%, rgba(255,218,100,0.18) 57%, transparent 80%);
          transform: translateX(-140%) skewX(-18deg);
          pointer-events: none;
        }
        .logo-shimmer.active { animation: logo-shimmer 1.6s cubic-bezier(0.25,0,0.35,1) forwards; }
        .spark {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #FFD980 0%, #C4924A 60%, transparent 100%);
          pointer-events: none;
          z-index: 5;
          animation: spark-rise var(--dur) ease-out forwards;
        }
        ._ts { animation: k10 0.5s cubic-bezier(.34,1.56,.64,1) forwards; display: flex; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* ── Logo ── */}
          <Link href="/" tabIndex={-1} className="flex-shrink-0">
            <div
              ref={shellRef}
              className={`logo-shell${hovered ? ' is-hovered' : ''}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              <div className="logo-glow" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/logo-csm.png`}
                alt="CSM - Campinas Shopping Móveis"
                className="logo-img"
                style={{
                  height: '54px',
                  width: 'auto',
                  transform: hovered
                    ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.07) translateY(-1px)`
                    : undefined,
                  transition: hovered
                    ? 'transform 0.12s ease-out, filter 0.4s ease'
                    : 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), filter 0.4s ease',
                }}
                draggable={false}
              />
              <div className="logo-shimmer-wrap">
                <div className={`logo-shimmer${shimmering ? ' active' : ''}`} />
              </div>
              {sparks.map(s => (
                <div
                  key={s.id}
                  className="spark"
                  style={{
                    left: `${s.x}%`, top: `${s.y}%`,
                    width: s.size, height: s.size,
                    '--dur': `${s.duration}s`, '--drift': `${s.drift}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </Link>

          {/* ── Barra de busca (centro) ── */}
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--g)' }}
            />
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Buscar produtos, acabamentos, dimensões..."
              className="_q w-full pl-10 pr-10 py-2 text-sm rounded-lg outline-none transition-all duration-200"
            />
            {value && (
              <button type="button" onClick={() => { setValue(''); router.push('/') }}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: 'var(--g)' }} />
              </button>
            )}
          </form>

          {/* ── Ícones direita ── */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              ref={btnRef}
              onClick={handleToggle}
              className="_b w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {mounted && (
                <span key={theme} className="_ts">
                  {isDark
                    ? <Sun  className="w-4 h-4" style={{ color: '#C8C4BE' }} />
                    : <Moon className="w-4 h-4" style={{ color: '#6B6460' }} />}
                </span>
              )}
            </button>

            <Link
              href="/favoritos"
              className="_b w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Favoritos"
            >
              <Heart className="w-4 h-4" style={{ color: 'var(--g)' }} />
            </Link>

            {/* Admin toggle — discreto */}
            <button
              onClick={toggleAdmin}
              tabIndex={-1}
              title=""
              className={`transition-opacity duration-300 w-6 h-6 flex items-center justify-center ${isAdmin ? 'opacity-50 hover:opacity-70' : 'opacity-10 hover:opacity-30'}`}
              style={{ color: 'var(--g)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isAdmin
                ? <LockOpen width={12} height={12} />
                : <Lock width={12} height={12} />}
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
