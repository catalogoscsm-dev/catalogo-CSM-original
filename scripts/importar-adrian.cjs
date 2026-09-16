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

// Detecta o tipo da imagem pelo nome do arquivo (sem extensão):
//   só letras  → capa (primária)  → rank 0
//   só números → galeria           → rank 1
//   nomes já formatados (pag XX, recorte...) também funcionam
function tipoImagem(filename) {
  const base = path.basename(filename, path.extname(filename)).trim()
  if (/^[a-zA-Z]+$/.test(base))  return 'capa'
  if (/^\d+$/.test(base))        return 'galeria'
  // nomes já formatados — mantém lógica antiga
  const l = filename.toLowerCase()
  if (l.includes('recorte'))     return 'capa'
  if (l.includes('gemini'))      return 'gemini'
  if (/^pag[\s_]/.test(l))      return 'galeria'
  return 'galeria'
}

function rankImagem(filename) {
  const t = tipoImagem(filename)
  if (t === 'capa')    return 0
  if (t === 'galeria') return 1
  if (t === 'gemini')  return 2
  return 1
}

// Renomeia arquivos de letras/números para nomes legíveis
function nomeFormatado(filename, pagNum, index, tipo) {
  const ext = path.extname(filename)
  const pagStr = String(pagNum).padStart(2, '0')
  if (tipo === 'capa')    return `pag ${pagStr}${ext}`
  // galeria: pag 02 galeria.png, pag 02 galeria b.png ...
  const sufixo = index === 0 ? '' : ` ${String.fromCharCode(98 + index - 1)}` // b, c, d...
  return `pag ${pagStr} galeria${sufixo}${ext}`
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
    const pageNum = parseInt(subpasta.replace(/\D/g, ''), 10)

    const arquivosRaw = fs.readdirSync(srcDir)
      .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
    if (arquivosRaw.length === 0) continue

    // ── Renomear letras/números para nomes decentes ───────────────────────────
    const capas    = arquivosRaw.filter(f => tipoImagem(f) === 'capa').sort()
    const galerias = arquivosRaw.filter(f => tipoImagem(f) === 'galeria').sort()
    const geminis  = arquivosRaw.filter(f => tipoImagem(f) === 'gemini').sort()

    function renomear(lista, tipo) {
      let gIdx = 0
      for (const f of lista) {
        const base = path.basename(f, path.extname(f))
        const isPureAlpha   = /^[a-zA-Z]+$/.test(base)
        const isPureNumeric = /^\d+$/.test(base)
        if (!isPureAlpha && !isPureNumeric) continue // já tem nome decente

        const novoNome = nomeFormatado(f, pageNum, tipo === 'galeria' ? gIdx++ : 0, tipo)
        const srcPath  = path.join(srcDir, f)
        const dstPath  = path.join(srcDir, novoNome)
        if (!fs.existsSync(dstPath)) {
          fs.renameSync(srcPath, dstPath)
          console.log(`  ↳ renomeado: ${f} → ${novoNome}`)
        }
      }
    }

    renomear(capas,    'capa')
    renomear(galerias, 'galeria')

    // ── Re-ler após renomeação ────────────────────────────────────────────────
    const arquivos = fs.readdirSync(srcDir)
      .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => rankImagem(a) - rankImagem(b) || a.localeCompare(b))

    const produtos = db.prepare('SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ?').all(cat.id, pageNum)
    if (!produtos.length) { console.warn(`  [${subpasta}] Sem produto na pág. ${pageNum}. Pulando.`); continue }

    const urls = []
    for (const arquivo of arquivos) {
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
