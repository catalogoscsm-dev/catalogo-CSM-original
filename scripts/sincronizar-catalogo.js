/**
 * sincronizar-catalogo.js
 *
 * Copia imagens de "imagens dos produtos" → public/imagens/{catalog}/
 * e atualiza o banco com paths /imagens/ (compatível com o site estático).
 *
 * Uso:
 *   node scripts/sincronizar-catalogo.js "NOME CATÁLOGO"
 *   node scripts/sincronizar-catalogo.js --todos           # processa todos
 *   node scripts/sincronizar-catalogo.js --todos --force   # reprocessa mesmo os que já têm imagens
 *
 * Flags:
 *   --force   Reprocessa produtos que já têm imagens
 *   --todos   Processa todos os catálogos sem imagens (ou todos com --force)
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const { BASE_CATALOGOS: BASE_DIR } = require('./config.cjs')
const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const args       = process.argv.slice(2)
const catalogoArg = args.find(a => !a.startsWith('--'))
const forceAll   = args.includes('--force')
const todos      = args.includes('--todos')

if (!catalogoArg && !todos) {
  console.error('\nUso:')
  console.error('  node scripts/sincronizar-catalogo.js "NOME CATÁLOGO"')
  console.error('  node scripts/sincronizar-catalogo.js --todos')
  console.error('  node scripts/sincronizar-catalogo.js --todos --force\n')
  process.exit(1)
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

function buildPath(catalogoPasta, filename) {
  return `/imagens/${encodeURIComponent(catalogoPasta)}/${encodeURIComponent(filename)}`
}

function parseFilename(filename) {
  const base = path.basename(filename, path.extname(filename))
  const low  = base.toLowerCase()
  const isRecorte = low.includes('recorte')

  const pagMatch = low.match(/pag[\s_]+recorte[\s_]+0*(\d+)/i)
    ?? low.match(/pag[\s_]+0*(\d+)/i)
    ?? low.match(/pag0*(\d+)/i)

  if (!pagMatch) return null
  return { pagina: parseInt(pagMatch[1], 10), isRecorte }
}

function sincronizarCatalogo(catalogoPasta) {
  const catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogoPasta)
  if (!catalogo) {
    console.error(`  ✗ Catálogo "${catalogoPasta}" não encontrado no banco.`)
    return { atualizados: 0, copiados: 0 }
  }

  const pastaImagens = path.join(BASE_DIR, catalogoPasta, 'imagens dos produtos')
  if (!fs.existsSync(pastaImagens)) {
    console.log(`  ~ Sem pasta "imagens dos produtos": ${catalogoPasta}`)
    return { atualizados: 0, copiados: 0 }
  }

  const pastaPublica = path.join(__dirname, '..', 'public', 'imagens', catalogoPasta)
  fs.mkdirSync(pastaPublica, { recursive: true })

  // Cache de produtos por página
  const cache = {}
  function getProduto(pagina) {
    if (cache[pagina] !== undefined) return cache[pagina]
    cache[pagina] = db.prepare(
      'SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?'
    ).get(catalogo.id, pagina) ?? null
    return cache[pagina]
  }

  function nearestProduto(pagina) {
    for (let offset = 1; offset <= 10; offset++) {
      const fwd = getProduto(pagina + offset)
      if (fwd) return { produto: fwd, direction: 'fwd', delta: offset }
      const bwd = getProduto(pagina - offset)
      if (bwd) return { produto: bwd, direction: 'bwd', delta: offset }
    }
    return null
  }

  // Escanear pasta
  const lote = {}
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
  if (paginas.length === 0) {
    console.log(`  ~ Nenhuma imagem reconhecida: ${catalogoPasta}`)
    return { atualizados: 0, copiados: 0 }
  }

  // Montar assignments
  const assignments = {}
  function ensureSlot(produto) {
    if (!assignments[produto.id]) assignments[produto.id] = { produto, cover: null, gallery: [] }
    return assignments[produto.id]
  }

  // Passagem 1: páginas COM produto
  for (const pagina of paginas) {
    const produto = getProduto(pagina)
    if (!produto) continue
    const existeImagens = JSON.parse(produto.imagens ?? '[]').length > 0
    if (existeImagens && !forceAll) continue
    const { mains, recortes } = lote[pagina]
    const slot = ensureSlot(produto)
    if (recortes.length > 0) {
      slot.cover = recortes[0]
      if (recortes.length > 1) slot.gallery.push(...recortes.slice(1))
      slot.gallery.push(...mains)
    } else if (mains.length > 0) {
      slot.cover = mains[0]
      if (mains.length > 1) slot.gallery.push(...mains.slice(1))
    }
  }

  // Passagem 2: páginas SEM produto → fallback para produto mais próximo
  for (const pagina of paginas) {
    const produto = getProduto(pagina)
    if (produto) continue
    const { mains, recortes } = lote[pagina]
    const allFiles = [...mains, ...recortes]
    if (allFiles.length === 0) continue
    const found = nearestProduto(pagina)
    if (!found) continue
    const existeImagens = JSON.parse(found.produto.imagens ?? '[]').length > 0
    if (existeImagens && !forceAll) continue
    const slot = ensureSlot(found.produto)
    slot.gallery.push(...allFiles)
  }

  // Copiar arquivos e atualizar banco
  const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
  let atualizados = 0
  let copiados = 0

  for (const { produto, cover, gallery } of Object.values(assignments)) {
    if (!cover && gallery.length === 0) continue

    const allFiles = [...(cover ? [cover] : []), ...gallery]

    // Copia para public/imagens
    for (const arq of allFiles) {
      const src  = path.join(pastaImagens, arq)
      const dest = path.join(pastaPublica, arq)
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest)
        copiados++
      }
    }

    let existentes = []
    try { existentes = JSON.parse(produto.imagens ?? '[]') } catch {}

    const novosSet = new Set(allFiles.map(f => f.toLowerCase()))
    const existentesOther = existentes.filter(img => {
      const fn = decodeURIComponent(img.split('/').pop() ?? '').toLowerCase()
      return !novosSet.has(fn)
    })

    const novasImagens = [
      ...(cover  ? [buildPath(catalogoPasta, cover)]        : []),
      ...gallery.map(g => buildPath(catalogoPasta, g)),
      ...existentesOther,
    ]

    updateImagens.run(JSON.stringify(novasImagens), produto.id)
    atualizados++
  }

  return { atualizados, copiados }
}

// ── Execução ──────────────────────────────────────────────────────────────────

if (todos) {
  const catalogos = db.prepare(`
    SELECT c.pasta, COUNT(p.id) as total,
           SUM(CASE WHEN p.imagens IS NOT NULL AND p.imagens != '[]' THEN 1 ELSE 0 END) as com_imagens
    FROM catalogos c
    LEFT JOIN produtos p ON p.catalogo_id = c.id
    GROUP BY c.id
    ORDER BY c.pasta
  `).all()

  const lista = forceAll
    ? catalogos.filter(c => c.total > 0)
    : catalogos.filter(c => c.total > 0 && (c.com_imagens ?? 0) === 0)

  console.log(`\nProcessando ${lista.length} catálogo(s)...\n`)

  let totalAtualizados = 0
  let totalCopiados = 0

  for (const cat of lista) {
    process.stdout.write(`  ${cat.pasta}... `)
    const { atualizados, copiados } = sincronizarCatalogo(cat.pasta)
    if (atualizados > 0) {
      console.log(`✓ ${atualizados} produto(s), ${copiados} arquivo(s) copiado(s)`)
    } else {
      console.log('sem alterações')
    }
    totalAtualizados += atualizados
    totalCopiados += copiados
  }

  console.log(`\n─────────────────────────────────`)
  console.log(`Total: ${totalAtualizados} produto(s) atualizados, ${totalCopiados} arquivo(s) copiados`)
  console.log(`\nPróximo passo: npm run export-data && git add . && git commit -m "imagens" && git push\n`)
} else {
  console.log(`\nCatálogo: ${catalogoArg}`)
  const { atualizados, copiados } = sincronizarCatalogo(catalogoArg)
  console.log(`✓ ${atualizados} produto(s) atualizados, ${copiados} arquivo(s) copiados`)
  if (atualizados > 0) {
    console.log(`\nPróximo passo: npm run export-data && git add . && git commit -m "imagens ${catalogoArg}" && git push\n`)
  }
}

db.close()
