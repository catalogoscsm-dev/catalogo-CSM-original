/**
 * importar-armil.cjs
 * Import script for catalogs with multiple products per page.
 * Handles folders: "pag 9", "pag 9b", "pag 9c", "pag 9d"
 *
 * Naming rules (based on source filename stem):
 *   "capa"        → capa (new tool)  → "recorte pag N[suffix].png"
 *   letters only  → capa (old style) → "recorte pag N[suffix].png"
 *   numbers only  → gallery (old)    → "pag N[suffix].png", "pag N[suffix]-2.png", ...
 *   "recorte pag" → gallery (new)    → "pag N[suffix].png", "pag N[suffix]-2.png", ...
 *   mixed/other   → gallery (warn)
 *
 * Sub-page numbering in DB:
 *   pag N  → pagina = N
 *   pag Nb → pagina = N + 0.1
 *   pag Nc → pagina = N + 0.2
 *   pag Nd → pagina = N + 0.3
 *
 * Usage:
 *   node scripts/importar-armil.cjs "ARMIL COMPLETO 2024"
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')
const { BASE_CATALOGOS } = require('./config.cjs')

const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

// pag 9  → { page: 9, suffix: '' }
// pag 9b → { page: 9, suffix: 'b' }
const PAG_RE = /^pag\s+0*(\d+)([bcdefghij]?)$/i
const SUFFIX_OFFSET = { '': 0, b: 0.1, c: 0.2, d: 0.3, e: 0.4, f: 0.5, g: 0.6, h: 0.7, i: 0.8, j: 0.9 }

function isLetterOnly(stem) { return /^[a-zA-ZçãõêâôíúàáäëüöÇÃÕÊÂÔÍÚÀÁÄËÜÖ,;.]+$/.test(stem) }
function isNumberOnly(stem) { return /^\d+$/.test(stem) }
function isGaleriaExplicito(stem) { return /^recorte\s+pag\b/i.test(stem) }

const catalogoNome = process.argv[2]
if (!catalogoNome) {
  console.error('\nUso: node scripts/importar-armil.cjs "NOME DO CATALOGO"\n')
  process.exit(1)
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

const catalogo = db.prepare('SELECT * FROM catalogos WHERE pasta = ?').get(catalogoNome)
if (!catalogo) {
  console.error(`Catálogo "${catalogoNome}" não encontrado no banco.`)
  process.exit(1)
}
console.log(`\nCatálogo: "${catalogo.pasta}" (id=${catalogo.id})`)

const basePath  = path.join(BASE_CATALOGOS, catalogo.pasta, 'imagens dos produtos')
const publicDir = path.join(__dirname, '..', 'public', 'imagens', catalogo.pasta)
fs.mkdirSync(publicDir, { recursive: true })

// Collect all pag folders
const subpastas = fs.readdirSync(basePath)
  .filter(e => {
    const full = path.join(basePath, e)
    return fs.statSync(full).isDirectory() && PAG_RE.test(e.trim())
  })
  .map(e => {
    const m = PAG_RE.exec(e.trim())
    const page   = parseInt(m[1], 10)
    const suffix = m[2].toLowerCase()
    const pagina = page + (SUFFIX_OFFSET[suffix] ?? 0)
    return { nome: e, page, suffix, pagina }
  })
  .sort((a, b) => a.pagina - b.pagina)

console.log(`${subpastas.length} subpasta(s) detectada(s)\n`)

const getByPagina  = db.prepare('SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ?')
const insertProd   = db.prepare('INSERT INTO produtos (catalogo_id, pagina, nome, imagens) VALUES (?, ?, ?, ?)')
const updateImg    = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')

let atualizados = 0

for (const { nome: subNome, page, suffix, pagina } of subpastas) {
  const subPath = path.join(basePath, subNome)
  const files = fs.readdirSync(subPath).filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
  if (files.length === 0) continue

  // Find or create product
  let prod = getByPagina.get(catalogo.id, pagina)
  if (!prod) {
    const placeholder = suffix ? `(produto pag ${page}${suffix} — atualizar nome)` : `(produto pag ${page} — atualizar nome)`
    const result = insertProd.run(catalogo.id, pagina, placeholder, '[]')
    prod = { id: result.lastInsertRowid, nome: placeholder, imagens: '[]' }
    console.log(`  [novo]  pag ${page}${suffix} → "${placeholder}"`)
  }

  const label = suffix ? `pag ${page}${suffix}` : `pag ${page}`
  const capas  = []
  const extras = []

  for (const file of files) {
    const stem = path.basename(file, path.extname(file))
    if (isLetterOnly(stem))          capas.push(file)   // antigo (letras) ou novo "capa"
    else if (isNumberOnly(stem))     extras.push(file)  // antigo (números)
    else if (isGaleriaExplicito(stem)) extras.push(file) // novo "recorte pag X"
    else {
      extras.push(file)
      console.warn(`  [warn]  "${file}" (nome misto) → tratado como galeria`)
    }
  }

  const novas = []

  // Capas → recorte pag N[suffix].png
  capas.forEach((file, idx) => {
    const ext     = path.extname(file)
    const newName = idx === 0 ? `recorte ${label}.png` : `recorte ${label}-${idx + 1}.png`
    fs.copyFileSync(path.join(subPath, file), path.join(publicDir, newName))
    novas.push(`/imagens/${encodeURIComponent(catalogo.pasta)}/${encodeURIComponent(newName)}`)
    console.log(`  [capa]  "${file}" → "${newName}"`)
  })

  // Extras → pag N[suffix].png, pag N[suffix]-2.png, ...
  extras.forEach((file, idx) => {
    const newName = idx === 0 ? `${label}.png` : `${label}-${idx + 1}.png`
    fs.copyFileSync(path.join(subPath, file), path.join(publicDir, newName))
    novas.push(`/imagens/${encodeURIComponent(catalogo.pasta)}/${encodeURIComponent(newName)}`)
    console.log(`  [foto]  "${file}" → "${newName}"`)
  })

  // Merge with existing, recortes first
  let existing = []
  try { existing = JSON.parse(prod.imagens || '[]') } catch {}
  const merged = [...new Set([...existing, ...novas])]
  const final  = [...merged.filter(u => u.includes('recorte')), ...merged.filter(u => !u.includes('recorte'))]

  updateImg.run(JSON.stringify(final), prod.id)
  console.log(`  ✓ "${prod.nome}" — ${final.length} imagem(ns)\n`)
  atualizados++
}

db.close()
console.log(`✓ ${atualizados} produto(s) atualizado(s).`)
console.log('  Execute agora: node scripts/export-data.js\n')
