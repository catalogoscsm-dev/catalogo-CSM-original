'use client'

import { useEffect, useState } from 'react'
import { Produto } from '@/lib/types'
import { Heart } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

const LS_KEY = 'csm_favoritos'

export default function FavoritosClient({ todos }: { todos: Produto[] }) {
  const [favIds, setFavIds] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavIds(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'))
  }, [])

  function remover(id: number) {
    const next = favIds.filter(f => f !== id)
    setFavIds(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const produtos = todos.filter(p => favIds.includes(p.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>Favoritos</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {!mounted ? '' : `${produtos.length} produto(s) salvos`}
        </p>
      </div>

      {mounted && produtos.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum produto favoritado ainda.</p>
        </div>
      )}

      {produtos.length > 0 && (
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
