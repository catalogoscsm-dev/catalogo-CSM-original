/**
 * importar-subpastas.cjs
 * Lê cada pasta "pag XX" de "imagens dos produtos", copia para public/
 * e atualiza o banco para todos os produtos daquela página.
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const CATALOG_PASTA = 'Aco Mobilia 2025-7'
const SRC_BASE      = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos'
const PUBLIC_BASE   = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)
const IMG_EXTS      = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) { console.error('Catálogo não encontrado'); process.exit(1) }

// ── Ordena: pag (sem recorte) → recortes → outros → gemini (último)
function sortImages(files) {
  const rank = f => {
    const l = f.toLowerCase()
    if (l.includes('gemini'))                             return 3
    if (l.includes('recorte'))                            return 1
    if (/pag[\s_-]*\d+/.test(l) || l.startsWith('pag')) return 0
    return 2
  }
  return [...files].sort((a, b) => {
    const dr = rank(a) - rank(b)
    if (dr !== 0) return dr
    return a.localeCompare(b)
  })
}

// ── Copia arquivo para public e retorna URL
function copyAndUrl(srcDir, subpasta, filename) {
  const destDir = path.join(PUBLIC_BASE, subpasta)
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(path.join(srcDir, filename), path.join(destDir, filename))
  return `/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(subpasta)}/${encodeURIComponent(filename)}`
}

// ── Lê subpastas com padrão "pag XX"
const subpastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^pag\s*\d+$/i.test(d.name))
  .map(d => d.name)
  .sort()

let totalAtualizados = 0

for (const subpasta of subpastas) {
  const srcDir = path.join(SRC_BASE, subpasta)
  const arquivos = fs.readdirSync(srcDir)
    .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))

  if (arquivos.length === 0) continue

  // Extrai número da página
  const pageNum = parseInt(subpasta.replace(/\D/g, ''), 10)

  // Encontra todos os produtos desta página
  const produtos = db.prepare(
    'SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ?'
  ).all(cat.id, pageNum)

  if (!produtos.length) {
    console.warn(`  [${subpasta}] Nenhum produto na página ${pageNum}. Pulando.`)
    continue
  }

  const ordenados = sortImages(arquivos)
  const urls = ordenados.map(f => copyAndUrl(srcDir, subpasta, f))

  // Atribui as mesmas imagens a todos os produtos da página
  for (const prod of produtos) {
    db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
      .run(JSON.stringify(urls), prod.id)
  }

  const nomes = produtos.map(p => p.nome).join(' + ')
  console.log(`  ✓ [${subpasta}] ${nomes} — ${urls.length} imagem(ns)`)
  urls.forEach((u, i) => console.log(`      ${i + 1}. ${decodeURIComponent(u.split('/').pop())}`))
  totalAtualizados += produtos.length
}

console.log(`\n${totalAtualizados} produto(s) atualizados.`)
db.close()
