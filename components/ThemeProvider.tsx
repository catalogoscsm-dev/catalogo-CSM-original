'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

type Theme = 'light' | 'dark'

type ThemeCtxType = {
  theme: Theme
  toggle: (origin?: { x: number; y: number }) => void
}

const ThemeCtx = createContext<ThemeCtxType>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme]     = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [ripple, setRipple]   = useState<{ x: number; y: number; color: string; id: number } | null>(null)
  const pending = useRef<Theme | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('csm-theme') as Theme | null
    if (saved) { setTheme(saved); applyTheme(saved) }
  }, [])

  function applyTheme(t: Theme) {
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  function toggle(origin?: { x: number; y: number }) {
    const next = theme === 'light' ? 'dark' : 'light'
    pending.current = next

    if (origin) {
      const color = next === 'dark' ? '#0A0A0A' : '#FAF8F3'
      setRipple({ x: origin.x, y: origin.y, color, id: Date.now() })

      setTimeout(() => {
        setTheme(next)
        applyTheme(next)
        localStorage.setItem('csm-theme', next)
      }, 320)

      setTimeout(() => setRipple(null), 900)
    } else {
      setTheme(next)
      applyTheme(next)
      localStorage.setItem('csm-theme', next)
    }
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
      {mounted && ripple && createPortal(
        <div
          key={ripple.id}
          style={{
            position: 'fixed',
            left: ripple.x,
            top: ripple.y,
            width: '300vmax',
            height: '300vmax',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            background: ripple.color,
            zIndex: 99998,
            pointerEvents: 'none',
            animation: 'csm-ripple 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        />,
        document.body
      )}
      {mounted && (
        <style>{`
          @keyframes csm-ripple {
            0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            70%  { opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          }
        `}</style>
      )}
    </ThemeCtx.Provider>
  )
}

export function useTheme() { return useContext(ThemeCtx) }
