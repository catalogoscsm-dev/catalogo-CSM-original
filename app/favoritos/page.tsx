'use client'

import { useEffect, useState } from 'react'
import { Produto } from '@/lib/types'
import { Heart } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

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
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>Favoritos</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {produtos.length} produto(s) salvos
        </p>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum produto favoritado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {produtos.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <ProductCard produto={p} favorito onToggleFavorito={remover} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
