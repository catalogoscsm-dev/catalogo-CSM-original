import { getDb } from '@/lib/db'
import { Produto, Catalogo } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

function getCatalogo(pasta: string): Catalogo | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT c.*, COUNT(p.id) as total_produtos
    FROM catalogos c
    LEFT JOIN produtos p ON p.catalogo_id = c.id
    WHERE c.pasta = ?
    GROUP BY c.id
  `).get(decodeURIComponent(pasta)) as Catalogo | null
  return row
}

function getProdutos(catalogoId: number): Produto[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE p.catalogo_id = ?
    ORDER BY p.pagina, p.nome
  `).all(catalogoId) as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

export default async function CatalogoPage({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params
  const catalogo = getCatalogo(marca)
  if (!catalogo) notFound()

  const produtos = getProdutos(catalogo.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/catalogos" className="transition-colors duration-200 hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>{catalogo.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{catalogo.total_produtos} produto(s)</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <p>Nenhum produto importado para este catálogo ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {produtos.map(p => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </div>
  )
}
