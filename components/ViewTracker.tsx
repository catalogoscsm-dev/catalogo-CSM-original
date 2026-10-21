'use client'

import { useEffect } from 'react'

const LS_VISTOS   = 'csm_visualizados'
const MAX_HIST    = 50
const EXPIRY_MS   = 7 * 24 * 60 * 60 * 1000 // 7 dias

export default function ViewTracker({ produtoId }: { produtoId: number }) {
  useEffect(() => {
    try {
      const cutoff = Date.now() - EXPIRY_MS
      const prev: { id: number; at: number }[] = JSON.parse(localStorage.getItem(LS_VISTOS) ?? '[]')
      const updated = [
        { id: produtoId, at: Date.now() },
        ...prev.filter(e => e.id !== produtoId && e.at > cutoff),
      ].slice(0, MAX_HIST)
      localStorage.setItem(LS_VISTOS, JSON.stringify(updated))
    } catch {}
  }, [produtoId])

  return null
}
