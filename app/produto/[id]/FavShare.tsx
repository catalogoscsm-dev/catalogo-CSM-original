'use client'

import { Heart, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function FavShare({ produtoId }: { produtoId: number }) {
  const [isFav, setIsFav] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [copied, setCopied] = useState(false)

  async function toggleFav() {
    const res = await fetch('/api/favoritos', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto_id: produtoId }),
    })
    if (res.ok) {
      setAnimating(true)
      setIsFav(!isFav)
      setTimeout(() => setAnimating(false), 600)
    }
  }

  async function compartilhar() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.5); }
          65%  { transform: scale(0.88); }
          85%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes heartGlow {
          0%   { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.5); }
          50%  { box-shadow: 0 0 0 10px rgba(251, 113, 133, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
        }
        .heart-pop { animation: heartPop 0.55s cubic-bezier(.36,.07,.19,.97) forwards; }
        .heart-glow { animation: heartGlow 0.6s ease-out forwards; }
      `}</style>

      <div className="flex gap-2.5">
        <button
          onClick={toggleFav}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${animating ? 'heart-glow' : ''}`}
          style={{
            background: isFav ? 'rgba(251,113,133,0.12)' : 'var(--surface)',
            border: `1px solid ${isFav ? 'rgba(251,113,133,0.45)' : 'var(--border)'}`,
            color: isFav ? '#fb7185' : 'var(--text-secondary)',
            boxShadow: isFav ? '0 0 16px rgba(251,113,133,0.12)' : 'none',
          }}
        >
          <span className={animating ? 'heart-pop' : ''} style={{ display: 'flex' }}>
            <Heart
              className="w-4 h-4 transition-all duration-300"
              fill={isFav ? 'currentColor' : 'none'}
            />
          </span>
          {isFav ? 'Salvo' : 'Favoritar'}
        </button>

        <button
          onClick={compartilhar}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-75 active:scale-95"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Copiado!' : 'Compartilhar'}
        </button>
      </div>
    </>
  )
}
