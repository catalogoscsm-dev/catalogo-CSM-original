import { Suspense } from 'react'
import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import ProductsView from '@/components/ProductsView'

function getProdutos(): Produto[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    LIMIT 500
  `).all() as (Produto & { imagens: string })[]
  return rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
}

function getTotalProdutos() {
  const db = getDb()
  return (db.prepare('SELECT COUNT(*) as n FROM produtos').get() as { n: number }).n
}

export default function Home() {
  const produtos = getProdutos()
  const total = getTotalProdutos()
  return (
    <Suspense>
      <ProductsView produtos={produtos} total={total} />
    </Suspense>
  )
}
