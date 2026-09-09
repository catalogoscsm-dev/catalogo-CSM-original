import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'

export function GET() {
  const db = getDb()
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM favoritos f
    JOIN produtos p ON f.produto_id = p.id
    JOIN catalogos c ON p.catalogo_id = c.id
    ORDER BY f.criado_em DESC
  `).all() as (Produto & { imagens: string })[]

  const data = rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') }))
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { produto_id } = await req.json()
  if (!produto_id) return NextResponse.json({ error: 'produto_id required' }, { status: 400 })

  const db = getDb()
  try {
    db.prepare('INSERT OR IGNORE INTO favoritos (produto_id) VALUES (?)').run(produto_id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { produto_id } = await req.json()
  if (!produto_id) return NextResponse.json({ error: 'produto_id required' }, { status: 400 })

  const db = getDb()
  db.prepare('DELETE FROM favoritos WHERE produto_id = ?').run(produto_id)
  return NextResponse.json({ ok: true })
}
