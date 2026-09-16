/**
 * importar-adrian.cjs
 * Importa imagens da pasta "Adrián Line 2023\imagens dos produtos"
 * para public/ e atualiza o banco de dados.
 * Uso: node scripts/importar-adrian.cjs
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const sharp    = require('sharp')

const { BASE_CATALOGOS } = require('./config.cjs')
const CATALOG_PASTA = 'Adrián Line 2023'
const SRC_BASE      = path.join(BASE_CATALOGOS, CATALOG_PASTA, 'imagens dos produtos')
const PUBLIC_BASE   = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)
const LOGO_PATH     = path.join(__dirname, '..', 'public', 'logo-csm.png')
const IMG_EXTS      = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])
const OPACITY       = 0.38
const LOGO_RATIO    = 0.14
const MARGIN_RATIO  = 0.025

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) { console.error('Catálogo não encontrado. Rode setup-adrian.cjs primeiro.'); process.exit(1) }

// ── Marca d'água ─────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function sortImages(files) {
  const rank = f => {
    const l = f.toLowerCase()
    if (l.includes('recorte'))                            return 1
    if (l.includes('gemini'))                             return 3
    if (/pag[\s_-]*\d+/.test(l) || l.startsWith('pag')) return 0
    return 2
  }
  return [...files].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

function limparNome(nome) {
  const SUFIXOS = { '(1)': 'b', '(2)': 'c', '(3)': 'd', '(4)': 'e' }
  let n = nome
    .replace(/\s*\[[^\]]*\]\s*/g, ' ')
    .replace(/\s*—\s*/g, ' ')
    .replace(/\.jfif$/i, '.jpg')
    .trim()
  for (const [s, l] of Object.entries(SUFIXOS)) n = n.replace(` ${s}`, l).replace(s, l)
  return n.replace(/\s+/g, ' ').trim()
}

// ── Importação ────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(PUBLIC_BASE, { recursive: true })

  const subpastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^pag\s*\d+$/i.test(d.name))
    .map(d => d.name)
    .sort()

  let totalAtualizados = 0

  for (const subpasta of subpastas) {
    const srcDir = path.join(SRC_BASE, subpasta)

    // limpar nomes
    for (const f of fs.readdirSync(srcDir)) {
      if (!IMG_EXTS.has(path.extname(f).toLowerCase())) continue
      const novo = limparNome(f)
      if (novo !== f && !fs.existsSync(path.join(srcDir, novo)))
        fs.renameSync(path.join(srcDir, f), path.join(srcDir, novo))
    }

    const arquivos = fs.readdirSync(srcDir).filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
    if (arquivos.length === 0) continue

    const pageNum = parseInt(subpasta.replace(/\D/g, ''), 10)
    const produtos = db.prepare('SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ?').all(cat.id, pageNum)
    if (!produtos.length) { console.warn(`  [${subpasta}] Sem produto na pág. ${pageNum}. Pulando.`); continue }

    const ordenados = sortImages(arquivos)
    const urls = []

    for (const arquivo of ordenados) {
      const srcPath  = path.join(srcDir, arquivo)
      const destPath = path.join(PUBLIC_BASE, arquivo)
      if (!fs.existsSync(destPath)) {
        process.stdout.write(`  Processando ${arquivo}...`)
        await aplicarWatermark(srcPath, destPath)
        console.log(' ✓')
      }
      urls.push(`/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(arquivo)}`)
    }

    for (const prod of produtos) {
      db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prod.id)
    }

    const nomes = produtos.map(p => p.nome).join(' + ')
    console.log(`  ✓ [${subpasta}] ${nomes} — ${urls.length} imagem(ns)`)
    totalAtualizados += produtos.length
  }

  console.log(`\n${totalAtualizados} produto(s) atualizados.`)
  db.close()
}

main().catch(e => { console.error(e); process.exit(1) })
