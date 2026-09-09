'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Produto } from '@/lib/types'
import { Heart } from 'lucide-react'

export default function FavoritosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/favoritos')
      .then(r => r.json())
      .then(data => { setProdutos(data); setLoading(false) })
  }, [])

  function remover(id: number) {
    setProdutos(prev => prev.filter(p => p.id !== id))
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favoritos</h1>
        <p className="text-gray-500 mt-1">{produtos.length} produto(s) salvos</p>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum produto favoritado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {produtos.map(p => (
            <ProductCard key={p.id} produto={p} favorito onToggleFavorito={remover} />
          ))}
        </div>
      )}
    </div>
  )
}
