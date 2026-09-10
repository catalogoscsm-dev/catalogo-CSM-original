import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const BASE_DIR = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados'
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function buildApiPath(catalog: string, filename: string) {
  return `/api/imagem/${encodeURIComponent(catalog)}/imagens%20dos%20produtos/${encodeURIComponent(filename)}`
}

function parseFilename(filename: string): { pagina: number; isRecorte: boolean } | null {
  const base = path.basename(filename, path.extname(filename))
  const low  = base.toLowerCase()
  const isRecorte = low.includes('recorte')
  const m = low.match(/pag[\s_]+recorte[\s_]+0*(\d+)/i)
    ?? low.match(/pag[\s_]+0*(\d+)/i)
    ?? low.match(/pag0*(\d+)/i)
  if (!m) return null
  return { pagina: parseInt(m[1], 10), isRecorte }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const { catalog } = await req.json()
    if (!catalog) return NextResponse.json({ error: 'catalog obrigatÃ³rio' }, { status: 400, headers: CORS })

    const db = getDb()

    const catalogRow = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalog) as { id: number } | null
    if (!catalogRow) return NextResponse.json({ error: `CatÃ¡logo "${catalog}" nÃ£o encontrado` }, { status: 404, headers: CORS })

    const pastaImagens = path.join(BASE_DIR, catalog, 'imagens dos produtos')
    if (!fs.existsSync(pastaImagens)) return NextResponse.json({ ok: true, updated: 0 }, { headers: CORS })

    // â”€â”€ Montar lote de arquivos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const lote: Record<number, { mains: string[]; recortes: string[] }> = {}

    for (const arq of fs.readdirSync(pastaImagens)) {
      const ext = path.extname(arq).toLowerCase()
      if (!IMG_EXTS.has(ext)) continue
      const parsed = parseFilename(arq)
      if (!parsed) continue
      const { pagina, isRecorte } = parsed
      if (!lote[pagina]) lote[pagina] = { mains: [], recortes: [] }
      if (isRecorte) lote[pagina].recortes.push(arq)
      else           lote[pagina].mains.push(arq)
    }

    const paginas = Object.keys(lote).map(Number).sort((a, b) => a - b)

    // â”€â”€ Helpers de busca no banco â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    type ProdRow = { id: number; nome: string; pagina: number; imagens: string }
    const _cache: Record<number, ProdRow | null> = {}

    const getProduto = (pagina: number): ProdRow | null => {
      if (_cache[pagina] !== undefined) return _cache[pagina]
      _cache[pagina] = (db.prepare(
        'SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?'
      ).get(catalogRow.id, pagina) ?? null) as ProdRow | null
      return _cache[pagina]
    }

    const nearestProduto = (pagina: number): ProdRow | null => {
      for (let off = 1; off <= 10; off++) {
        const fwd = getProduto(pagina + off); if (fwd) return fwd
        const bwd = getProduto(pagina - off); if (bwd) return bwd
      }
      return null
    }

    // â”€â”€ AtribuiÃ§Ãµes por produto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const slots: Record<number, { produto: ProdRow; cover: string | null; gallery: string[] }> = {}

    const ensureSlot = (p: ProdRow) => {
      if (!slots[p.id]) slots[p.id] = { produto: p, cover: null, gallery: [] }
      return slots[p.id]
    }

    // Passagem 1: pÃ¡ginas COM produto direto
    for (const pagina of paginas) {
      const produto = getProduto(pagina)
      if (!produto) continue
      if ((JSON.parse(produto.imagens ?? '[]') as string[]).length > 0) continue
      const { mains, recortes } = lote[pagina]
      const slot = ensureSlot(produto)
      if (recortes.length > 0) {
        slot.cover = recortes[0]
        slot.gallery.push(...recortes.slice(1), ...mains)
      } else if (mains.length > 0) {
        slot.cover = mains[0]
        slot.gallery.push(...mains.slice(1))
      }
    }

    // Passagem 2: pÃ¡ginas Ã³rfÃ£s â†’ produto mais prÃ³ximo
    for (const pagina of paginas) {
      const produto = getProduto(pagina)
      if (produto) continue
      const allFiles = [...lote[pagina].mains, ...lote[pagina].recortes]
      if (!allFiles.length) continue
      const found = nearestProduto(pagina)
      if (!found) continue
      if ((JSON.parse(found.imagens ?? '[]') as string[]).length > 0) continue
      ensureSlot(found).gallery.push(...allFiles)
    }

    // â”€â”€ Gravar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
    let updated = 0

    for (const { produto, cover, gallery } of Object.values(slots)) {
      if (!cover && gallery.length === 0) continue
      let existentes: string[] = []
      try { existentes = JSON.parse(produto.imagens ?? '[]') } catch {}

      const novosSet = new Set([...(cover ? [cover] : []), ...gallery].map(f => f.toLowerCase()))
      const existentesOther = existentes.filter(img =>
        !novosSet.has(decodeURIComponent(img.split('/').pop() ?? '').toLowerCase())
      )

      const novasImagens = [
        ...(cover ? [buildApiPath(catalog, cover)] : []),
        ...gallery.map(g => buildApiPath(catalog, g)),
        ...existentesOther,
      ]
      updateImagens.run(JSON.stringify(novasImagens), produto.id)
      updated++
    }

    return NextResponse.json({ ok: true, updated, catalog }, { headers: CORS })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[sync-imagens]', msg)
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS })
  }
}

