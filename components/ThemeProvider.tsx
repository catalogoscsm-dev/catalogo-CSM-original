'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('csm-theme') as Theme | null
    if (saved) { setTheme(saved); applyTheme(saved) }
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    const body = document.body
    if (t === 'dark') {
      root.style.setProperty('--cream', '#0D0B08')
      root.style.setProperty('--warm-white', '#17140F')
      root.style.setProperty('--charcoal', '#F0EBE3')
      root.style.setProperty('--muted', '#8C8075')
      root.style.setProperty('--border', '#2C2719')
      root.style.setProperty('--card-bg', '#17140F')
      body.style.backgroundImage = 'linear-gradient(160deg, #0D0B08 0%, #110E09 60%, #15110C 100%)'
      body.style.backgroundAttachment = 'fixed'
      body.style.backgroundColor = '#0D0B08'
    } else {
      root.style.setProperty('--cream', '#FFFFFF')
      root.style.setProperty('--warm-white', '#FFFFFF')
      root.style.setProperty('--charcoal', '#1A1714')
      root.style.setProperty('--muted', '#8A8480')
      root.style.setProperty('--border', '#F0EAE0')
      root.style.setProperty('--card-bg', '#FFFFFF')
      body.style.backgroundImage = 'linear-gradient(160deg, #FFFFFF 0%, #F9F5EF 40%, #F3EDE3 100%)'
      body.style.backgroundAttachment = 'fixed'
      body.style.backgroundColor = '#FFFFFF'
    }
  }

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    localStorage.setItem('csm-theme', next)
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export function useTheme() { return useContext(ThemeCtx) }
