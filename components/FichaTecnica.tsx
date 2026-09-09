'use client'

import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

interface Item { label: string; value: string }

export default function FichaTecnica({ items }: { items: Item[] }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && theme === 'dark'

  const rowEven = isDark ? 'rgba(23,20,15,0.9)'  : 'rgba(253,252,251,0.9)'
  const rowOdd  = isDark ? 'rgba(30,26,18,0.7)'  : 'rgba(247,244,240,0.6)'
  const border  = isDark ? 'rgba(44,39,25,0.6)'  : 'var(--border)'
  const labelColor = isDark ? '#8C8075'           : 'var(--muted)'
  const valueColor = isDark ? '#F0EBE3'           : 'var(--charcoal)'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
      {items.map(({ label, value }, i) => (
        <div
          key={label}
          className="flex items-start gap-4 px-5 py-3.5"
          style={{
            background: i % 2 === 0 ? rowEven : rowOdd,
            borderBottom: i < items.length - 1 ? `1px solid ${border}` : 'none',
          }}
        >
          <span className="text-xs font-medium w-36 shrink-0 pt-0.5 uppercase tracking-wide"
            style={{ color: labelColor }}>
            {label}
          </span>
          <span className="text-sm" style={{ color: valueColor }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
