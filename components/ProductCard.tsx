'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Share2, Ruler, Package } from 'lucide-react'
import { Produto } from '@/lib/types'
import { useState } from 'react'

interface Props {
  produto: Produto
  favorito?: boolean
  onToggleFavorito?: (id: number) => void
}

export default function ProductCard({ produto, favorito = false, onToggleFavorito }: Props) {
  const [isFav, setIsFav] = useState(favorito)
  const [sharing, setSharing] = useState(false)

  const primeiraImagem = produto.imagens?.[0] ?? null

  async function toggleFavorito(e: React.MouseEvent) {
    e.preventDefault()
    const res = await fetch('/api/favoritos', {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto_id: produto.id }),
    })
    if (res.ok) {
      setIsFav(!isFav)
      onToggleFavorito?.(produto.id)
    }
  }

  async function compartilhar(e: React.MouseEvent) {
    e.preventDefault()
    setSharing(true)
    const url = `${window.location.origin}/produto/${produto.id}`
    await navigator.clipboard.writeText(url)
    setTimeout(() => setSharing(false), 2000)
  }

  return (
    <Link href={`/produto/${produto.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square bg-white">
          {primeiraImagem ? (
            <Image
              src={primeiraImagem}
              alt={produto.nome}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Package className="w-12 h-12 text-gray-300" />
              <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wide">Sem imagem</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={toggleFavorito}
              className={`p-2 rounded-full shadow-sm transition-colors ${
                isFav ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={compartilhar}
              className="p-2 rounded-full bg-white shadow-sm text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {sharing && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs text-center py-1 rounded">
              Link copiado!
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
            {produto.nome}
          </h3>
          {produto.dimensoes && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Ruler className="w-3 h-3" />
              {produto.dimensoes}
            </div>
          )}
          {produto.material && (
            <p className="text-xs text-gray-500 mt-1">{produto.material}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
