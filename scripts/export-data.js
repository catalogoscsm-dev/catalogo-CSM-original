// Run locally after adding new products: npm run export-data
// CI uses the committed data/static-data.json — does NOT run this script.
const Database = require('better-sqlite3')
const crypto   = require('crypto')
const fs       = require('fs')
const path     = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })

const produtos = db.prepare(`
  SELECT p.id, p.nome, p.descricao, p.material, p.dimensoes, p.acabamento,
         p.cores, p.texto_livre, p.imagens, p.categoria, p.criado_em
  FROM produtos p
  ORDER BY p.id
`).all().map(r => ({ ...r, imagens: JSON.parse(r.imagens || '[]'), categoria: r.categoria ?? null }))

db.close()

// ── Image hashing & copy ───────────────────────────────────────────────────
const EXTS = { '.png': 'png', '.jpg': 'jpg', '.jpeg': 'jpg', '.webp': 'webp', '.gif': 'gif' }

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 12)
}

const imgOutDir = path.join(__dirname, '../public/img')
fs.mkdirSync(imgOutDir, { recursive: true })

let copied = 0, skipped = 0, missing = 0

const produtosHashed = produtos.map(produto => ({
  ...produto,
  imagens: produto.imagens.map(imgUrl => {
    const hash = hashUrl(imgUrl)
    const rawExt = path.extname(decodeURIComponent(imgUrl)).toLowerCase()
    const ext = EXTS[rawExt] ? `.${EXTS[rawExt]}` : rawExt || '.jpg'
    const destFile = path.join(imgOutDir, `${hash}${ext}`)
    if (!fs.existsSync(destFile)) {
      const srcFile = path.join(__dirname, '../public', decodeURIComponent(imgUrl))
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile)
        copied++
      } else {
        missing++
      }
    } else {
      skipped++
    }
    return `/img/${hash}${ext}`
  }),
}))

// ── Write outputs ─────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '../data')
fs.mkdirSync(outDir, { recursive: true })

// Public JSON — only public fields, no supplier identifiers, no catalogos list
fs.writeFileSync(
  path.join(outDir, 'static-data.json'),
  JSON.stringify({ produtos: produtosHashed })
)

// First-image index per product (public — hash URLs only, no supplier info)
const imagesIndex = {}
for (const p of produtosHashed) {
  if (p.imagens.length > 0) imagesIndex[p.id] = p.imagens[0]
}
fs.writeFileSync(
  path.join(__dirname, '../public/imagens-index.json'),
  JSON.stringify(imagesIndex)
)

console.log(`Exportado: ${produtos.length} produtos → data/static-data.json`)
console.log(`Imagens: ${copied} copiadas, ${skipped} já existiam, ${missing} não encontradas`)
console.log(`Índice: ${Object.keys(imagesIndex).length} entradas → public/imagens-index.json`)
