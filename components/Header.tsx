'use client'

import Link from 'next/link'
import { useRef, useEffect, useState, useCallback } from 'react'

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
  const shellRef              = useRef<HTMLDivElement>(null)
  const [shimmering, setShimmering] = useState(false)
  const [sparks, setSparks]   = useState<Spark[]>([])
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  /* ── Shimmer automático ── */
  useEffect(() => {
    const fire = () => {
      setShimmering(true)
      setTimeout(() => setShimmering(false), 1700)
    }
    const t0 = setTimeout(fire, 1800)
    const iv = setInterval(fire, 6000)
    return () => { clearTimeout(t0); clearInterval(iv) }
  }, [])

  /* ── Partículas douradas ── */
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

  /* ── Tilt 3D no hover/touch ── */
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
        .logo-shell {
          position: relative;
          display: inline-flex;
          border-radius: 6px;
          animation: logo-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both;
          cursor: pointer;
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
          filter:
            drop-shadow(0 6px 20px rgba(140,110,24,0.4))
            brightness(1.06);
        }
        .logo-glow {
          position: absolute;
          inset: -20px -28px;
          background: radial-gradient(
            ellipse 70% 55% at 50% 60%,
            rgba(140, 110, 24, 0.12) 0%,
            transparent 70%
          );
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
          background: linear-gradient(
            108deg,
            transparent 20%,
            rgba(255, 218, 100, 0.18) 43%,
            rgba(255, 248, 190, 0.58) 50%,
            rgba(255, 218, 100, 0.18) 57%,
            transparent 80%
          );
          transform: translateX(-140%) skewX(-18deg);
          pointer-events: none;
        }
        .logo-shimmer.active {
          animation: logo-shimmer 1.6s cubic-bezier(0.25, 0, 0.35, 1) forwards;
        }
        .spark {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #FFD980 0%, #C4924A 60%, transparent 100%);
          pointer-events: none;
          z-index: 5;
          animation: spark-rise var(--dur) ease-out forwards;
        }
      `}</style>

      <div className="px-4">
        <div className="flex items-center h-20">
          <Link href="/" className="flex items-center" tabIndex={-1}>
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
                  height: '90px',
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
                    left:   `${s.x}%`,
                    top:    `${s.y}%`,
                    width:  s.size,
                    height: s.size,
                    '--dur':   `${s.duration}s`,
                    '--drift': `${s.drift}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
