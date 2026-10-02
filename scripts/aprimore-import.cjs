/**
 * aprimore-import.cjs
 * Renomeia e importa imagens da pasta "aprimore decor 2025"
 * Letras aleatórias → capa (recorte pag N.png)
 * Números aleatórios → fotos adicionais (pag N.png, pag Nb.png, ...)
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')
const { BASE_CATALOGOS } = require('./config.cjs')

const DB_PATH = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const PAG_RE = /^pag\s+0*(\d+)$/i

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// Find catalog
const CATALOG_NAME = 'aprimore decor 2025'
const catalogo = db.prepare("SELECT * FROM catalogos WHERE pasta LIKE ?").get('%aprimore%')
if (!catalogo) { console.error('Catálogo não encontrado'); process.exit(1) }

console.log(`Catálogo: "${catalogo.pasta}" (id=${catalogo.id})`)

const basePath = path.join(BASE_CATALOGOS, catalogo.pasta, 'imagens dos produtos')
const publicDir = path.join(__dirname, '..', 'public', 'imagens', catalogo.pasta)
fs.mkdirSync(publicDir, { recursive: true })

// Check if filename is purely letters (capa) or purely numbers (extra)
// Letters: only alphabetic chars (a-z, A-Z) in the stem
// Numbers: only numeric chars (0-9) in the stem
function isLetterOnly(stem) {
  return /^[a-zA-Z,;.çãõêâô]+$/.test(stem)
}
function isNumberOnly(stem) {
  return /^\d+$/.test(stem)
}

const SUFFIX_LETTERS = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

const getProduto = db.prepare(
  'SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?'
)
const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')

// List all pag subfolders
const entries = fs.readdirSync(basePath)
const subpastas = entries
  .filter(e => {
    const full = path.join(basePath, e)
    return fs.statSync(full).isDirectory() && PAG_RE.test(e.trim())
  })
  .map(e => {
    const m = PAG_RE.exec(e.trim())
    return { nome: e, pagina: parseInt(m[1], 10) }
  })
  .sort((a, b) => a.pagina - b.pagina)

console.log(`\n${subpastas.length} subpastas encontradas\n`)

// Accumulate by produto (one produto can span multiple pags)
const byProduto = {}

for (const { nome: subNome, pagina } of subpastas) {
  const subPath = path.join(basePath, subNome)
  const files = fs.readdirSync(subPath)
    .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))

  if (files.length === 0) continue

  const prod = getProduto.get(catalogo.id, pagina)
  if (!prod) {
    console.warn(`  [pag ${pagina}] Produto não encontrado no banco. Pulando.`)
    continue
  }

  if (!byProduto[prod.id]) {
    byProduto[prod.id] = { prod, capas: [], extras: [], pagina }
  }

  for (const file of files) {
    const stem = path.basename(file, path.extname(file))
    const ext = path.extname(file)
    if (isLetterOnly(stem)) {
      byProduto[prod.id].capas.push({ subNome, file, ext, pagina })
    } else if (isNumberOnly(stem)) {
      byProduto[prod.id].extras.push({ subNome, file, ext, pagina })
    } else {
      // Mixed/unknown — treat as extra
      byProduto[prod.id].extras.push({ subNome, file, ext, pagina })
      console.warn(`  [pag ${pagina}] Arquivo de nome ambíguo "${file}" tratado como extra`)
    }
  }
}

// Now rename, copy, and update DB
let atualizados = 0
for (const { prod, capas, extras, pagina: prodPag } of Object.values(byProduto)) {
  const novasImagens = []

  // Capas → "recorte pag N.png", "recorte pag Na.png", ...
  capas.forEach((item, idx) => {
    const suffix = idx === 0 ? '' : SUFFIX_LETTERS[idx - 1]
    const newName = `recorte pag ${item.pagina}${suffix}${item.ext}`
    const dst = path.join(publicDir, newName)
    const src = path.join(basePath, item.subNome, item.file)
    fs.copyFileSync(src, dst)
    novasImagens.push(`/imagens/${encodeURIComponent(catalogo.pasta)}/${encodeURIComponent(newName)}`)
    console.log(`  [capa]  "${item.file}" → "${newName}"`)
  })

  // Extras → "pag N.png", "pag Nb.png", ...
  extras.forEach((item, idx) => {
    const suffix = idx === 0 ? '' : SUFFIX_LETTERS[idx - 1]
    const newName = `pag ${item.pagina}${suffix}${item.ext}`
    const dst = path.join(publicDir, newName)
    const src = path.join(basePath, item.subNome, item.file)
    fs.copyFileSync(src, dst)
    novasImagens.push(`/imagens/${encodeURIComponent(catalogo.pasta)}/${encodeURIComponent(newName)}`)
    console.log(`  [extra] "${item.file}" → "${newName}"`)
  })

  if (novasImagens.length === 0) continue

  // Merge with any existing images (keep new ones, deduplicate)
  let existingImagens = []
  try { existingImagens = JSON.parse(prod.imagens || '[]') } catch {}
  const existingSet = new Set(existingImagens)
  for (const img of novasImagens) existingSet.add(img)
  const merged = [...existingSet]

  // Reorder: recortes first
  const recortes = merged.filter(u => u.includes('recorte'))
  const outros = merged.filter(u => !u.includes('recorte'))
  const final = [...recortes, ...outros]

  updateImagens.run(JSON.stringify(final), prod.id)
  console.log(`  ✓ "${prod.nome}" — ${final.length} imagem(ns) total\n`)
  atualizados++
}

db.close()
console.log(`\n✓ ${atualizados} produto(s) atualizado(s).`)
console.log('  Execute agora: node scripts/export-data.js')
