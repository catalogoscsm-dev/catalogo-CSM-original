export const dynamic = 'force-static'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { normalizeQuery } from '@/lib/search'
import { Produto } from '@/lib/types'

export async function POST(req: Request) {
  const body = await req.json()
  const { catalogo_pasta, ...produto } = body

  if (!catalogo_pasta || !produto.nome) {
    return NextResponse.json({ error: 'catalogo_pasta e nome sÃ£o obrigatÃ³rios' }, { status: 400 })
  }

  const db = getDb()
  const catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogo_pasta) as { id: number } | null
  if (!catalogo) {
    return NextResponse.json({ error: 'CatÃ¡logo nÃ£o encontrado' }, { status: 404 })
  }

  const stmt = db.prepare(`
    INSERT INTO produtos (catalogo_id, codigo, nome, descricao, material, dimensoes, acabamento, cores, preco_min, preco_max, pagina, texto_livre, imagens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    catalogo.id,
    produto.codigo ?? null,
    produto.nome,
    produto.descricao ?? null,
    produto.material ?? null,
    produto.dimensoes ?? null,
    produto.acabamento ?? null,
    produto.cores ?? null,
    produto.preco_min ?? null,
    produto.preco_max ?? null,
    produto.pagina ?? null,
    produto.texto_livre ?? null,
    JSON.stringify(produto.imagens ?? []),
  )

  return NextResponse.json({ id: result.lastInsertRowid })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const db = getDb()

  const nq = `%${normalizeQuery(q)}%`
  const rows = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE norm(p.nome) LIKE ? OR norm(p.material) LIKE ? OR norm(p.descricao) LIKE ?
    LIMIT 50
  `).all(nq, nq, nq) as (Produto & { imagens: string })[]

  return NextResponse.json(rows.map(r => ({ ...r, imagens: JSON.parse(r.imagens ?? '[]') })))
}

