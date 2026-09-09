import { Suspense } from 'react'
import SearchBar from '@/components/SearchBar'
import ProductCard from '@/components/ProductCard'
import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'

function getProdutos(q?: string, catalogo?: string): Produto[] {
  const db = getDb()
  let sql = `
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE 1=1
  `
  const params: unknown[] = []

  if (q) {
    sql += ` AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.material LIKE ? OR p.texto_livre LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
  }
  if (catalogo) {
    sql += ` AND c.pasta = ?`
    params.push(catalogo)
  }

  sql += ` LIMIT 60`
  const rows = db.prepare(sql).all(...params) as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

function getTotalCatalogos(): number {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as total FROM catalogos').get() as { total: number }
  return row.total
}

function getTotalProdutos(): number {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as total FROM produtos').get() as { total: number }
  return row.total
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; catalogo?: string }>
}) {
  return (
    <Suspense>
      <HomeContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}

async function HomeContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ q?: string; catalogo?: string }>
}) {
  const { q, catalogo } = await searchParamsPromise
  const produtos = getProdutos(q, catalogo)
  const totalCatalogos = getTotalCatalogos()
  const totalProdutos = getTotalProdutos()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900">Catálogo Digital</h1>
        <p className="text-gray-500 text-lg">
          {totalCatalogos} catálogos · {totalProdutos} produtos
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">Nenhum produto encontrado</p>
          {q && <p className="text-sm mt-2">Tente buscar por outro termo</p>}
          {totalProdutos === 0 && (
            <p className="text-sm mt-4 text-gray-400">
              O catálogo ainda não foi alimentado com produtos.
            </p>
          )}
        </div>
      ) : (
        <>
          {q && (
            <p className="text-sm text-gray-500">
              {produtos.length} resultado(s) para &quot;{q}&quot;
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {produtos.map(p => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
