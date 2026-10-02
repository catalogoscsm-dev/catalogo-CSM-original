/**
 * importar-imagens-subpastas.js
 *
 * Importa imagens organizadas em SUBPASTAS por página dentro de "imagens dos produtos/".
 *
 * Estrutura esperada:
 *   <pasta base>/imagens dos produtos/pag 04/recorte pag 4 mesa.png
 *   <pasta base>/imagens dos produtos/pag 04/pag 5.png
 *   <pasta base>/imagens dos produtos/pag 04/Gemini_Generated_Image_xxx.jpg
 *   <pasta base>/imagens dos produtos/pag 06/recorte pag 6.png
 *   <pasta base>/imagens dos produtos/pag 06/recorte pag 6b.png
 *   ...
 *
 * Regras de prioridade dentro de cada subpasta:
 *   1. Arquivos com "recorte" no nome → primeiro item do array (capa)
 *   2. Demais arquivos → galeria
 *   3. Se não há recorte, o primeiro arquivo encontrado vira capa
 *
 * Uso:
 *   node scripts/importar-imagens-subpastas.js "Aco Mobilia 2025-7"
 *   node scripts/importar-imagens-subpastas.js "ACQUARELLA - AGO 2023"
 *   node scripts/importar-imagens-subpastas.js --todos
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const { BASE_CATALOGOS } = require('./config.cjs')

const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const PAG_RE   = /^pag\s+0*(\d+)$/i  // nome da subpasta: "pag 04", "pag 06", etc.

// ── Argumento ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
if (!args.length) {
  console.error('\nUso: node scripts/importar-imagens-subpastas.js "NOME_CATALOGO"')
  console.error('     node scripts/importar-imagens-subpastas.js --todos\n')
  process.exit(1)
}

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

function getCatalogos() {
  return db.prepare('SELECT id, pasta FROM catalogos ORDER BY pasta').all()
}

function runCatalogo(catalogoPasta) {
  const basePath  = path.join(BASE_CATALOGOS, catalogoPasta, 'imagens dos produtos')
  const publicDir = path.join(__dirname, '..', 'public', 'imagens', catalogoPasta)

  if (!fs.existsSync(basePath)) {
    console.warn(`  [${catalogoPasta}] Pasta "imagens dos produtos" não encontrada. Pulando.`)
    return 0
  }

  const catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogoPasta)
  if (!catalogo) {
    console.warn(`  [${catalogoPasta}] Catálogo não encontrado no banco. Pulando.`)
    return 0
  }

  // Listar subpastas do tipo "pag N"
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

  if (subpastas.length === 0) {
    console.warn(`  [${catalogoPasta}] Nenhuma subpasta "pag N" encontrada.`)
    return 0
  }

  console.log(`\n[${catalogoPasta}] ${subpastas.length} subpasta(s) detectada(s)`)

  fs.mkdirSync(publicDir, { recursive: true })

  const getProduto = db.prepare(
    'SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?'
  )

  const updateImagens = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')

  // Cache de produto mais próximo
  function nearestProduto(pagina) {
    for (let d = 1; d <= 10; d++) {
      const fwd = getProduto.get(catalogo.id, pagina + d)
      if (fwd) return fwd
      const bwd = getProduto.get(catalogo.id, pagina - d)
      if (bwd) return bwd
    }
    return null
  }

  // accumulate all images per produto (pode chegar de várias subpastas)
  const byProduto = {}

  for (const { nome: subNome, pagina } of subpastas) {
    const subPath = path.join(basePath, subNome)
    const files = fs.readdirSync(subPath)
      .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))

    if (files.length === 0) continue

    // Determinar produto
    const prod = getProduto.get(catalogo.id, pagina) ?? nearestProduto(pagina)
    if (!prod) {
      console.warn(`  [pag ${pagina}] Nenhum produto encontrado. Pulando.`)
      continue
    }

    if (!byProduto[prod.id]) {
      byProduto[prod.id] = { prod, recortes: [], outros: [] }
    }

    for (const file of files) {
      const isRecorte = /recorte/i.test(file)
      const entry = { subNome, file }
      if (isRecorte) {
        byProduto[prod.id].recortes.push(entry)
      } else {
        byProduto[prod.id].outros.push(entry)
      }
    }

    console.log(`  pag ${String(pagina).padStart(3)} → "${prod.nome}" (${files.length} arquivo(s))`)
  }

  // Gravar no banco e copiar arquivos
  let atualizados = 0
  for (const { prod, recortes, outros } of Object.values(byProduto)) {
    const todasOrdenadas = [...recortes, ...outros]
    const novasImagens = []

    for (const { subNome, file } of todasOrdenadas) {
      const src  = path.join(basePath, subNome, file)
      const dst  = path.join(publicDir, file)
      if (!fs.existsSync(dst)) {
        fs.copyFileSync(src, dst)
      }
      novasImagens.push(`/imagens/${encodeURIComponent(catalogoPasta)}/${encodeURIComponent(file)}`)
    }

    // Desduplicar URLs
    const unique = [...new Set(novasImagens)]
    updateImagens.run(JSON.stringify(unique), prod.id)

    console.log(`  ✓ "${prod.nome}" — ${unique.length} imagem(ns)`)
    atualizados++
  }

  return atualizados
}

// ── Main ────────────────────────────────────────────────────────────────────

let total = 0

if (args[0] === '--todos') {
  const todos = getCatalogos()
  for (const { pasta } of todos) {
    const src = path.join(BASE_CATALOGOS, pasta, 'imagens dos produtos')
    if (!fs.existsSync(src)) continue
    const temSubpastas = fs.readdirSync(src).some(e => {
      const full = path.join(src, e)
      return fs.statSync(full).isDirectory() && PAG_RE.test(e.trim())
    })
    if (!temSubpastas) continue
    total += runCatalogo(pasta)
  }
} else {
  total = runCatalogo(args[0])
}

db.close()
console.log(`\n✓ ${total} produto(s) atualizado(s) no total.`)
console.log('  Execute agora: node scripts/export-data.js\n')
