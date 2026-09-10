import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import FavoritosClient from './FavoritosClient'

export default function FavoritosPage() {
  const db = getDb()
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    ORDER BY p.nome
  `).all() as (Produto & { imagens: string })[]

  const todos = rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))

  return <FavoritosClient todos={todos} />
}
