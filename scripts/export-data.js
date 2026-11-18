// Run locally after adding new products: npm run export-data
// CI uses the committed data/static-data.json — does NOT run this script.
const Database = require('better-sqlite3')
const crypto   = require('crypto')
const fs       = require('fs')
const path     = require('path')
const sharp    = require('sharp')

const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })

const produtos = db.prepare(`
  SELECT p.id, p.nome, p.descricao, p.material, p.dimensoes, p.acabamento,
         p.cores, p.texto_livre, p.imagens, p.categoria, p.criado_em
  FROM produtos p
  ORDER BY p.id
`).all().map(r => ({ ...r, imagens: JSON.parse(r.imagens || '[]'), categoria: r.categoria ?? null }))

db.close()

// ── Image hashing & WebP conversion ───────────────────────────────────────
const MAX_SIDE = 1400   // px
const WEBP_Q   = 80     // quality

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 12)
}

const imgOutDir = path.join(__dirname, '../public/img')
fs.mkdirSync(imgOutDir, { recursive: true })

async function toWebp(srcFile, destFile) {
  await sharp(srcFile)
    .resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // remove transparency
    .webp({ quality: WEBP_Q })
    .toFile(destFile)
}

// ── Process all referenced images ─────────────────────────────────────────
const urlMap = {}  // origUrl → /img/<hash>.webp

const toProcess = []
for (const produto of produtos) {
  for (const imgUrl of produto.imagens) {
    if (urlMap[imgUrl]) continue
    const hash = hashUrl(imgUrl)
    const destFile = path.join(imgOutDir, `${hash}.webp`)
    const srcFile  = path.join(__dirname, '../imagens-src', decodeURIComponent(imgUrl))
    urlMap[imgUrl] = `/img/${hash}.webp`
    toProcess.push({ srcFile, destFile, exists: fs.existsSync(destFile), srcExists: fs.existsSync(srcFile) })
  }
}

let converted = 0, skipped = 0, missing = 0

;(async () => {
  for (const { srcFile, destFile, exists, srcExists } of toProcess) {
    if (exists) { skipped++; continue }
    if (!srcExists) { missing++; continue }
    try {
      await toWebp(srcFile, destFile)
      converted++
    } catch (e) {
      console.warn(`WARN: falha ao converter ${path.basename(srcFile)}: ${e.message}`)
      missing++
    }
  }

  // Build hashed product list
  const produtosHashed = produtos.map(p => ({
    ...p,
    imagens: p.imagens.map(imgUrl => urlMap[imgUrl] || '').filter(Boolean),
  }))

  // ── Write outputs ──────────────────────────────────────────────────────
  const outDir = path.join(__dirname, '../data')
  fs.mkdirSync(outDir, { recursive: true })

  fs.writeFileSync(
    path.join(outDir, 'static-data.json'),
    JSON.stringify({ produtos: produtosHashed })
  )

  const imagesIndex = {}
  for (const p of produtosHashed) {
    if (p.imagens.length > 0) imagesIndex[p.id] = p.imagens[0]
  }
  fs.writeFileSync(
    path.join(__dirname, '../public/imagens-index.json'),
    JSON.stringify(imagesIndex)
  )

  // ── Size report ────────────────────────────────────────────────────────
  const imgFiles = fs.readdirSync(imgOutDir)
  const totalMB = imgFiles.reduce((s, f) => {
    try { return s + fs.statSync(path.join(imgOutDir, f)).size } catch { return s }
  }, 0) / (1024 * 1024)

  console.log(`Exportado: ${produtos.length} produtos → data/static-data.json`)
  console.log(`Imagens: ${converted} convertidas, ${skipped} já existiam, ${missing} não encontradas`)
  console.log(`public/img: ${imgFiles.length} arquivos, ${totalMB.toFixed(1)} MB`)
  console.log(`Índice: ${Object.keys(imagesIndex).length} entradas → public/imagens-index.json`)
})()
