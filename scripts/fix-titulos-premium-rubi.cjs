'use strict'
// Corrige imagens do Premium (pag 70) e Rubi (pag 80)
// que ficaram com o título visível por falha do auto-crop.

const path  = require('path')
const fs    = require('fs')
const sharp = require('sharp')
const Database = require('better-sqlite3')
const { BASE_CATALOGOS } = require('./config.cjs')

const DB_PATH   = path.join(__dirname, '../database/catalogo.db')
const LOGO_PATH = path.join(__dirname, '../public/logo-csm.png')
const db        = new Database(DB_PATH)
const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null

const OPACITY      = 0.38
const LOGO_RATIO   = 0.14
const MARGIN_RATIO = 0.025
const CATALOGO     = 'Artecouro 2026'
const BASE_IMG     = path.join(BASE_CATALOGOS, 'Artecouro 2025', 'imagens dos produtos', CATALOGO)
const PUBLIC_DIR   = path.join(__dirname, '../public/imagens', CATALOGO)
const SKIP_FILES   = new Set(['full.png','full.jpg','full2.png','ficha tecn.png'])

async function detectarCropForcado(srcPath) {
  // Detecta com threshold menor (60% pixels claros) para pegar cabeçalhos sutis
  const { data, info } = await sharp(srcPath).grayscale().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const maxScan = Math.floor(height * 0.35)
  let lastHeaderRow = 0
  for (let y = 0; y < maxScan; y++) {
    const rowStart = y * width
    let whitePixels = 0
    for (let x = 0; x < width; x++) {
      if (data[rowStart + x] > 200) whitePixels++
    }
    if (whitePixels / width > 0.60) lastHeaderRow = y
  }
  return lastHeaderRow > height * 0.02 ? lastHeaderRow + 8 : 0
}

async function aplicarWatermark(srcPath, destPath, cropTop) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  let img = sharp(srcPath)
  const meta0 = await img.metadata()
  if (cropTop > 0) {
    img = sharp(srcPath).extract({ left: 0, top: cropTop, width: meta0.width, height: meta0.height - cropTop })
  }
  const { width, height } = cropTop > 0
    ? { width: meta0.width, height: meta0.height - cropTop }
    : meta0

  if (!logoBuffer) { await img.toFile(destPath); return }
  const logoW   = Math.max(60, Math.round(width * LOGO_RATIO))
  const margin  = Math.round(width * MARGIN_RATIO)
  const resized = await sharp(logoBuffer).resize({ width: logoW, fit: 'inside' }).png().toBuffer()
  const meta    = await sharp(resized).metadata()
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * OPACITY)
  const overlay = await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
  await img
    .composite([{ input: overlay, left: width - meta.width - margin, top: height - meta.height - margin }])
    .toFile(destPath)
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_')
}

async function fixPagina(pagNum) {
  const prod = db.prepare('SELECT id, nome, imagens FROM produtos WHERE catalogo_id = 96 AND pagina = ?').get(pagNum)
  if (!prod) { console.error(`Produto da pag ${pagNum} não encontrado`); return }

  const srcDir = path.join(BASE_IMG, `pag ${pagNum}`)
  if (!fs.existsSync(srcDir)) { console.error(`Pasta pag ${pagNum} não encontrada`); return }

  const files = fs.readdirSync(srcDir)
    .filter(f => !SKIP_FILES.has(f.toLowerCase()) && /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort((a, b) => (a.toLowerCase() === 'capa.png' ? -1 : b.toLowerCase() === 'capa.png' ? 1 : 0))

  const urls = []
  for (const file of files) {
    const slug    = sanitizeFilename(`${CATALOGO}_pag${pagNum}_${file}`)
    const srcPath = path.join(srcDir, file)
    const dstPath = path.join(PUBLIC_DIR, slug)
    const cropTop = await detectarCropForcado(srcPath)
    console.log(`  pag ${pagNum} ${prod.nome} → ${slug} (crop: ${cropTop}px)`)
    await aplicarWatermark(srcPath, dstPath, cropTop)
    urls.push(`/imagens/${encodeURIComponent(CATALOGO)}/${encodeURIComponent(slug)}`)
  }

  db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prod.id)
  console.log(`  ✅ ${prod.nome} (ID ${prod.id}) atualizado com ${urls.length} imagem(ns)`)
}

async function main() {
  console.log('Corrigindo Premium (pag 70) e Rubi (pag 80)...\n')
  await fixPagina(70)
  await fixPagina(80)
  db.close()
  console.log('\nConcluído.')
}

main().catch(e => { console.error(e); process.exit(1) })
