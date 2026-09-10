/**
 * importar-imagens.js
 *
 * Uso:
 *   node scripts/importar-imagens.js "ABV 2025" "C:\Users\joao.miguel\Desktop\fotos ABV"
 *
 * Convenção de nomes na pasta de origem:
 *   pag 17.jpg         → foto de capa do produto cuja página no DB é 17
 *   pag recorte 17.png → foto de capa (recorte limpo) — tem prioridade como capa sobre pag 17
 *   pag 18.jpg         → se a pág 18 não tiver produto, vai como galeria do produto mais próximo
 *
 * Regras de prioridade:
 *   1. Se existe  "pag recorte N" → ela é a CAPA do produto (pagina = N)
 *   2. Se existe  "pag N" e também "pag recorte N" → "pag N" vira GALERIA do mesmo produto
 *   3. Se existe  "pag N" e não há "pag recorte N"  → "pag N" é a CAPA
 *   4. Se "pag N" ou "pag recorte N" não encontrar produto em N, busca o produto
 *      mais próximo (N+1, N-1, N+2, N-2 … até 10 páginas) e adiciona como GALERIA
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

// ── Configurações ──────────────────────────────────────────────────────────────

const BASE_DIR = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados'
const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

// ── Argumentos ─────────────────────────────────────────────────────────────────

const [,, catalogoPasta, pastaOrigem] = process.argv

if (!catalogoPasta || !pastaOrigem) {
  console.error('\nUso: node scripts/importar-imagens.js "NOME_CATALOGO" "PASTA_COM_FOTOS"\n')
  console.error('Exemplo:')
  console.error('  node scripts/importar-imagens.js "ABV 2025" "C:\\Users\\joao\\Desktop\\fotos"\n')
  process.exit(1)
}

if (!fs.existsSync(pastaOrigem)) {
  console.error(`\nPasta de origem não encontrada: ${pastaOrigem}\n`)
  process.exit(1)
}

// ── Banco de dados ─────────────────────────────────────────────────────────────

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

const catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogoPasta)
if (!catalogo) {
  console.error(`\nCatálogo "${catalogoPasta}" não encontrado no banco de dados.`)
  console.error('Catálogos disponíveis:')
  db.prepare('SELECT pasta FROM catalogos').all().forEach(c => console.error('  -', c.pasta))
  process.exit(1)
}

const pastaDestino = path.join(BASE_DIR, catalogoPasta, 'imagens dos produtos')
fs.mkdirSync(pastaDestino, { recursive: true })

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildApiPath(filename) {
  return `/api/imagem/${encodeURIComponent(catalogoPasta)}/imagens%20dos%20produtos/${encodeURIComponent(filename)}`
}

function copyFile(arq) {
  fs.copyFileSync(path.join(pastaOrigem, arq), path.join(pastaDestino, arq))
  return buildApiPath(arq)
}

const _cache = {}
function getProduto(pagina) {
  if (_cache[pagina] !== undefined) return _cache[pagina]
  _cache[pagina] = db.prepare(
    'SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?'
  ).get(catalogo.id, pagina) ?? null
  return _cache[pagina]
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

// ── Escanear pasta de origem ───────────────────────────────────────────────────

const PAG_RE     = /^pag\s+(\d+)\.\w+$/i
const RECORTE_RE = /^pag\s+recorte\s+(\d+)\.\w+$/i

// lote[pagina] = { main: arquivo|null, recortes: arquivo[] }
const lote = {}

for (const arq of fs.readdirSync(pastaOrigem)) {
  const ext = path.extname(arq).toLowerCase()
  if (!IMG_EXTS.has(ext)) continue

  let m
  m = RECORTE_RE.exec(arq)
  if (m) {
    const pag = parseInt(m[1], 10)
    if (!lote[pag]) lote[pag] = { main: null, recortes: [] }
    lote[pag].recortes.push(arq)
    continue
  }
  m = PAG_RE.exec(arq)
  if (m) {
    const pag = parseInt(m[1], 10)
    if (!lote[pag]) lote[pag] = { main: null, recortes: [] }
    lote[pag].main = arq
  }
}

const paginas = Object.keys(lote).map(Number).sort((a, b) => a - b)

if (paginas.length === 0) {
  console.warn('\nNenhum arquivo reconhecido. Padrões aceitos:  pag 17.jpg  /  pag recorte 18.png\n')
  process.exit(0)
}

console.log(`\nCatálogo : ${catalogoPasta}`)
console.log(`Arquivos : ${paginas.length} página(s) detectada(s)\n`)

// ── Montar atribuições por produto ────────────────────────────────────────────
// assignments[produtoId] = { produto, cover: string|null, gallery: string[] }

const assignments = {}

function ensureSlot(produto) {
  if (!assignments[produto.id]) {
    assignments[produto.id] = { produto, cover: null, gallery: [] }
  }
  return assignments[produto.id]
}

// Primeira passagem: páginas COM produto direto
for (const pagina of paginas) {
  const produto = getProduto(pagina)
  if (!produto) continue

  const { main, recortes } = lote[pagina]
  const slot = ensureSlot(produto)

  if (recortes.length > 0) {
    // recorte tem prioridade como capa
    slot.cover = recortes[0]
    if (recortes.length > 1) slot.gallery.push(...recortes.slice(1))
    // main vai como galeria (foto da página inteira)
    if (main) slot.gallery.push(main)
  } else if (main) {
    slot.cover = main
  }
}

// Segunda passagem: páginas SEM produto direto → fallback para produto mais próximo
for (const pagina of paginas) {
  const produto = getProduto(pagina)
  if (produto) continue  // já tratado

  const { main, recortes } = lote[pagina]
  const allFiles = [...(main ? [main] : []), ...recortes]
  if (allFiles.length === 0) continue

  const found = nearestProduto(pagina)
  if (!found) {
    console.warn(`  [pág ${pagina}] Nenhum produto próximo encontrado. Pulando.`)
    continue
  }

  const slot = ensureSlot(found.produto)
  slot.gallery.push(...allFiles)
  console.log(
    `  [pág ${pagina}] → galeria de "${found.produto.nome}" (pág ${found.produto.pagina})`
  )
}

// ── Gravar no banco ───────────────────────────────────────────────────────────

const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')

let atualizados = 0

for (const { produto, cover, gallery } of Object.values(assignments)) {
  // Imagens existentes que não foram substituídas nesta importação
  let existentes = []
  try { existentes = JSON.parse(produto.imagens ?? '[]') } catch {}

  // Remove da lista existente qualquer arquivo que veio da pasta de origem (evita duplicar)
  const arquivosNovos = new Set([
    ...(cover   ? [cover]  : []),
    ...gallery,
  ].map(f => f.toLowerCase()))

  const existentesOther = existentes.filter(img => {
    const filename = decodeURIComponent(img.split('/').pop() ?? '').toLowerCase()
    return !arquivosNovos.has(filename)
  })

  // Copiar arquivos novos para a pasta do catálogo
  const novasImagens = []

  if (cover) novasImagens.push(copyFile(cover))
  for (const g of gallery) novasImagens.push(copyFile(g))
  novasImagens.push(...existentesOther)

  updateImagens.run(JSON.stringify(novasImagens), produto.id)

  const resumo = [
    cover             ? `capa: ${cover}`                  : '(sem capa nova)',
    gallery.length    ? `+${gallery.length} galeria`       : null,
  ].filter(Boolean).join('  |  ')

  console.log(`  [pág ${produto.pagina}] ✓ ${produto.nome}  —  ${resumo}`)
  atualizados++
}

console.log(`\n${atualizados} produto(s) atualizado(s).\n`)
db.close()
