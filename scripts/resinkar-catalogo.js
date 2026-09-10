/**
 * resinkar-catalogo.js
 *
 * Lê a pasta "imagens dos produtos" de um catálogo e liga os arquivos
 * que ainda não estão no banco. Funciona com qualquer convenção de nome,
 * desde que o número da página apareça no filename.
 *
 * Padrões reconhecidos (exemplos):
 *   pag 18.png
 *   pag recorte 19.png
 *   ABV 2025 — sub [18] pag 20.png
 *   ABV 2025 — sub [18] recorte pag 21.png
 *   ABV 2025 recorte pag 9.png
 *   ABV 2025 — sub [2]_pag_001.png        → considera "001" como página 1
 *   ABV 2025 — sub [2]_pag2_recorte.png   → página 2, recorte
 *
 * Uso:
 *   node scripts/resinkar-catalogo.js "ABV 2025"
 *
 * Flags:
 *   --force   Processa todos os produtos, mesmo os que já têm foto
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

// ── Configuração ───────────────────────────────────────────────────────────────

const BASE_DIR = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados'
const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

// ── Argumentos ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const catalogoPasta = args.find(a => !a.startsWith('--'))
const forceAll      = args.includes('--force')

if (!catalogoPasta) {
  console.error('\nUso: node scripts/resinkar-catalogo.js "NOME_CATALOGO" [--force]\n')
  process.exit(1)
}

// ── Banco ──────────────────────────────────────────────────────────────────────

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

const catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogoPasta)
if (!catalogo) {
  console.error(`\nCatálogo "${catalogoPasta}" não encontrado.`)
  db.prepare('SELECT pasta FROM catalogos').all().forEach(c => console.error('  -', c.pasta))
  process.exit(1)
}

const pastaImagens = path.join(BASE_DIR, catalogoPasta, 'imagens dos produtos')
if (!fs.existsSync(pastaImagens)) {
  console.error(`\nPasta não encontrada: ${pastaImagens}\n`)
  process.exit(1)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildApiPath(filename) {
  return `/api/imagem/${encodeURIComponent(catalogoPasta)}/imagens%20dos%20produtos/${encodeURIComponent(filename)}`
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

// ── Extração de número de página a partir do nome do arquivo ──────────────────
//
// Estratégia: testa padrões do mais específico para o mais genérico.
//
// "recorte" indica foto cropped/limpa → prioridade como capa.
// O número de página é o primeiro grupo numérico encontrado após "pag".

function parseFilename(filename) {
  const base = path.basename(filename, path.extname(filename))
  const low  = base.toLowerCase()

  const isRecorte = low.includes('recorte')

  // 1. "recorte pag 19" ou "recorte_pag_19" ou "pag 19 recorte"
  // 2. "pag 19" (sem recorte)
  // Captura o número que aparece depois de "pag" (com qualquer separador)
  const pagMatch = low.match(/pag[\s_]+recorte[\s_]+0*(\d+)/i)  // "pag recorte N"
    ?? low.match(/pag[\s_]+0*(\d+)/i)                           // "pag N"
    ?? low.match(/pag0*(\d+)/i)                                  // "pagN"

  if (!pagMatch) return null

  const pagina = parseInt(pagMatch[1], 10)
  return { pagina, isRecorte }
}

// ── Escanear pasta ────────────────────────────────────────────────────────────

const lote = {}   // { [pagina]: { mains: string[], recortes: string[] } }

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
console.log(`\nCatálogo : ${catalogoPasta}`)
console.log(`Imagens  : ${paginas.length} página(s) com arquivos\n`)

// ── Atribuição por produto ────────────────────────────────────────────────────
// assignments[produtoId] = { produto, cover: string|null, gallery: string[] }

const assignments = {}

function ensureSlot(produto) {
  if (!assignments[produto.id]) {
    assignments[produto.id] = { produto, cover: null, gallery: [] }
  }
  return assignments[produto.id]
}

// Passagem 1: páginas COM produto direto
for (const pagina of paginas) {
  const produto = getProduto(pagina)
  if (!produto) continue

  const existeImagens = JSON.parse(produto.imagens ?? '[]').length > 0
  if (existeImagens && !forceAll) continue  // já tem fotos, pula

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
  if (!found) {
    console.warn(`  [pág ${pagina}] Sem produto próximo. Pulando.`)
    continue
  }

  // Se o produto alvo já tem fotos e não é --force, pula
  const existeImagens = JSON.parse(found.produto.imagens ?? '[]').length > 0
  if (existeImagens && !forceAll) continue

  const slot = ensureSlot(found.produto)
  slot.gallery.push(...allFiles)

  const dir = found.direction === 'fwd' ? `→ próxima +${found.delta}` : `← anterior -${found.delta}`
  console.log(
    `  [pág ${pagina}] ${dir} → galeria de "${found.produto.nome}" (pág ${found.produto.pagina})`
  )
}

// ── Gravar no banco ───────────────────────────────────────────────────────────

const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
let atualizados = 0

for (const { produto, cover, gallery } of Object.values(assignments)) {
  if (!cover && gallery.length === 0) continue

  let existentes = []
  try { existentes = JSON.parse(produto.imagens ?? '[]') } catch {}

  // Arquivos novos que vêm desta passagem
  const novosSet = new Set(
    [...(cover ? [cover] : []), ...gallery].map(f => f.toLowerCase())
  )
  // Mantém imagens existentes que não estão sendo substituídas
  const existentesOther = existentes.filter(img => {
    const fn = decodeURIComponent(img.split('/').pop() ?? '').toLowerCase()
    return !novosSet.has(fn)
  })

  const novasImagens = [
    ...(cover  ? [buildApiPath(cover)]          : []),
    ...gallery.map(g => buildApiPath(g)),
    ...existentesOther,
  ]

  updateImagens.run(JSON.stringify(novasImagens), produto.id)

  const resumo = [
    cover           ? `capa: ${cover}`              : '(sem capa nova)',
    gallery.length  ? `+${gallery.length} galeria`  : null,
  ].filter(Boolean).join('  |  ')

  console.log(`  [pág ${produto.pagina}] ✓ ${produto.nome}  —  ${resumo}`)
  atualizados++
}

console.log(`\n${atualizados} produto(s) atualizado(s).\n`)
db.close()
