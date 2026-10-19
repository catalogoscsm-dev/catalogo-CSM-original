/**
 * importar-ALUMINAS-2024.cjs
 * Importa imagens de "ALUMINAS 2024" para public/ e atualiza o banco.
 * Uso: node scripts/importar-ALUMINAS-2024.cjs
 *
 * Estrutura esperada:
 *   catalogos separados/ALUMINAS 2024/imagens dos produtos/pag XX/
 *     letra.jpg  → capa (foto principal)
 *     1.jpg      → galeria (foto secundária)
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const sharp    = require('sharp')

const { BASE_CATALOGOS } = require('./config.cjs')
const CATALOG_PASTA = 'ALUMINAS 2024'
const SRC_BASE      = path.join(BASE_CATALOGOS, CATALOG_PASTA, 'imagens dos produtos')
const PUBLIC_BASE   = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)
const LOGO_PATH     = path.join(__dirname, '..', 'public', 'logo-csm.png')
const IMG_EXTS      = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])
const SKIP_FILES    = new Set(['full.png','full.jpg','ficha tecn.png','ficha tecn.jpg'])
const OPACITY       = 0.38
const LOGO_RATIO    = 0.14
const MARGIN_RATIO  = 0.025

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) { console.error('Catálogo não encontrado. Rode setup-aluminas.cjs primeiro.'); process.exit(1) }

const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null

async function aplicarWatermark(srcPath, destPath) {
  if (!logoBuffer) { fs.copyFileSync(srcPath, destPath); return }
  const img  = sharp(srcPath)
  const { width, height } = await img.metadata()
  const logoW  = Math.max(60, Math.round(width * LOGO_RATIO))
  const margin = Math.round(width * MARGIN_RATIO)
  const resized = await sharp(logoBuffer).resize({ width: logoW, fit: 'inside' }).png().toBuffer()
  const meta    = await sharp(resized).metadata()
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * OPACITY)
  const overlay = await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
  await sharp(srcPath)
    .composite([{ input: overlay, left: width - meta.width - margin, top: height - meta.height - margin, blend: 'over' }])
    .toFile(destPath)
}

function tipoImagem(filename) {
  const base = path.basename(filename, path.extname(filename)).trim()
  if (/^[a-zA-Z]+$/.test(base))       return 'capa'
  if (/^\d+$/.test(base))             return 'galeria'
  if (/^pag\s*\d+\.[a-z]+$/.test(filename.toLowerCase())) return 'capa'
  if (filename.toLowerCase().includes('galeria')) return 'galeria'
  return 'galeria'
}

function rankImagem(filename) {
  return tipoImagem(filename) === 'capa' ? 0 : 1
}

async function main() {
  fs.mkdirSync(PUBLIC_BASE, { recursive: true })

  const SUFFIX_IDX = { '': 0, 'b': 1, 'c': 2, 'd': 3 }

  const subpastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^pag\s*\d+[a-d]?$/i.test(d.name))
    .map(d => d.name)
    .sort()

  let totalAtualizados = 0

  for (const subpasta of subpastas) {
    const srcDir  = path.join(SRC_BASE, subpasta)
    const match   = subpasta.match(/^pag\s*(\d+)([a-d]?)$/i)
    const pageNum = parseInt(match[1], 10)
    const suffix  = match[2].toLowerCase()
    const prodIdx = SUFFIX_IDX[suffix] ?? 0

    const arquivos = fs.readdirSync(srcDir)
      .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()) && !SKIP_FILES.has(f.toLowerCase()))
      .sort((a, b) => rankImagem(a) - rankImagem(b) || a.localeCompare(b))

    if (!arquivos.length) continue

    const todosProdutos = db.prepare(
      'SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ? ORDER BY id'
    ).all(cat.id, pageNum)

    const produtos = prodIdx < todosProdutos.length ? [todosProdutos[prodIdx]] : []

    if (!produtos.length) {
      console.warn(`  [${subpasta}] Sem produto na pág. ${pageNum} índice ${prodIdx}. Pulando.`)
      continue
    }

    const urls = []
    for (const arquivo of arquivos) {
      const ext      = path.extname(arquivo)
      const base     = path.basename(arquivo, ext)
      const slug     = `pag${String(pageNum).padStart(2,'0')}${suffix}_${base}${ext}`
      const srcPath  = path.join(srcDir, arquivo)
      const destPath = path.join(PUBLIC_BASE, slug)
      process.stdout.write(`  Processando ${slug}...`)
      await aplicarWatermark(srcPath, destPath)
      console.log(' ✓')
      urls.push(`/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(slug)}`)
    }

    for (const prod of produtos) {
      db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prod.id)
    }

    const nomes = produtos.map(p => `${p.nome} (${p.descricao})`).join(' + ')
    console.log(`  ✓ [${subpasta}] ${nomes} — ${urls.length} imagem(ns)`)
    totalAtualizados += produtos.length
  }

  console.log(`\n${totalAtualizados} produto(s) atualizados.`)
  db.close()
}

main().catch(e => { console.error(e); process.exit(1) })
