import { Suspense } from 'react'
import ProductCard from '@/components/ProductCard'
import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'

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
    sql += ` AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.material LIKE ? OR p.texto_livre LIKE ? OR p.acabamento LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
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

export default function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <Suspense>
      <HomeContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}

async function HomeContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ q?: string }> }) {
  const { q } = await searchParamsPromise
  const produtos = getProdutos(q)
  const { catalogos, produtos: totalProdutos } = getTotais()

  return (
    <div className="space-y-8">

      {/* Contadores */}
      <div className="flex items-center gap-2 animate-fade-in">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {q
            ? <>{produtos.length} resultado(s) para <span style={{ color: 'var(--bronze)' }}>"{q}"</span></>
            : <>{catalogos} coleções · {totalProdutos} produtos</>}
        </p>
      </div>

      {/* Grid de produtos */}
      {produtos.length === 0 ? (
        <div className="text-center py-24 space-y-3 animate-fade-in">
          <p className="text-2xl font-light" style={{ color: 'var(--muted)', fontFamily: "'Playfair Display', serif" }}>
            {q ? `Nenhum resultado para "${q}"` : 'Nenhum produto ainda'}
          </p>
          {q && <p className="text-sm" style={{ color: 'var(--muted)' }}>Tente buscar por outro termo</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {produtos.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
