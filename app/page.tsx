import { Suspense } from 'react'
import { getDb } from '@/lib/db'
import { normalizeQuery } from '@/lib/search'
import { Produto } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
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
  sql += ` LIMIT 60`
  const rows = db.prepare(sql).all(...params) as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

function getTotais() {
  const db = getDb()
  const catalogos = (db.prepare('SELECT COUNT(*) as n FROM catalogos').get() as { n: number }).n
  const produtos  = (db.prepare('SELECT COUNT(*) as n FROM produtos').get() as { n: number }).n
  return { catalogos, produtos }
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
  const { catalogos, produtos: totalProdutos } = getTotais()

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {q
            ? <>{produtos.length} resultado(s) para <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{q}"</span></>
            : <>{catalogos} coleções · {totalProdutos} produtos</>}
        </p>
      </div>

      {produtos.length === 0 ? (
        <div className="text-center py-24 space-y-3 animate-fade-in">
          <p className="text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
            {q ? `Nenhum resultado para "${q}"` : 'Nenhum produto ainda'}
          </p>
          {q && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tente buscar por outro termo</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {produtos.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
