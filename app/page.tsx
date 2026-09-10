import { Suspense } from 'react'
import { getDb } from '@/lib/db'
import { normalizeQuery } from '@/lib/search'
import { Produto } from '@/lib/types'
import ProductsView from '@/components/ProductsView'
import SkeletonCard from '@/components/SkeletonCard'

function getProdutos(q?: string): Produto[] {
  const db = getDb()
  let sql = `
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE 1=1
  `
  const params: unknown[] = []
  if (q) {
    const nq = `%${normalizeQuery(q)}%`
    sql += ` AND (norm(p.nome) LIKE ? OR norm(p.descricao) LIKE ? OR norm(p.material) LIKE ? OR norm(p.texto_livre) LIKE ? OR norm(p.acabamento) LIKE ?)`
    params.push(nq, nq, nq, nq, nq)
  }
  sql += ` LIMIT 200`
  const rows = db.prepare(sql).all(...params) as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

function getTotalProdutos() {
  const db = getDb()
  return (db.prepare('SELECT COUNT(*) as n FROM produtos').get() as { n: number }).n
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export default function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <HomeContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}

async function HomeContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ q?: string }> }) {
  const { q } = await searchParamsPromise
  const produtos = getProdutos(q)
  const total = getTotalProdutos()

  return (
    <ProductsView produtos={produtos} total={total} query={q} />
  )
}
