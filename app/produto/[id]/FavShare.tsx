'use client'

import { Heart, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function FavShare({ produtoId }: { produtoId: number }) {
  const [isFav, setIsFav] = useState(false)
  const [copied, setCopied] = useState(false)

  async function toggleFav() {
    const res = await fetch('/api/favoritos', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto_id: produtoId }),
    })
    if (res.ok) setIsFav(!isFav)
  }

  async function compartilhar() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={toggleFav}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          isFav
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        {isFav ? 'Salvo' : 'Favoritar'}
      </button>
      <button
        onClick={compartilhar}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 text-sm font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {copied ? 'Copiado!' : 'Compartilhar'}
      </button>
    </div>
  )
}
