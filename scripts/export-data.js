// Run after adding new products: npm run export-data
// Also runs automatically before `next build` (see package.json build script)
const Database = require('better-sqlite3')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })

const produtos = db.prepare(`
  SELECT p.id, p.nome, p.descricao, p.material, p.dimensoes, p.acabamento,
         p.cores, p.texto_livre, p.imagens, p.categoria, p.criado_em
  FROM produtos p
  ORDER BY p.id
`).all().map(r => ({ ...r, imagens: JSON.parse(r.imagens || '[]'), categoria: r.categoria ?? null }))

const catalogos = db.prepare(`
  SELECT c.*, COUNT(p.id) as total_produtos
  FROM catalogos c
  LEFT JOIN produtos p ON p.catalogo_id = c.id
  GROUP BY c.id
  ORDER BY c.nome
`).all()

db.close()

// ── Image hashing ──────────────────────────────────────────────────────────
const CONTENT_TYPES = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
}

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 12)
}

function contentTypeOf(url) {
  const ext = path.extname(decodeURIComponent(url)).toLowerCase()
  return CONTENT_TYPES[ext] || 'application/octet-stream'
}

// imageMap: hash → { path, contentType }  — private, never served via HTTP
const imageMap = {}

const produtosHashed = produtos.map(produto => ({
  ...produto,
  imagens: produto.imagens.map(imgUrl => {
    const hash = hashUrl(imgUrl)
    imageMap[hash] = { path: imgUrl, contentType: contentTypeOf(imgUrl) }
    return `/api/img/${hash}`
  }),
}))

// ── Write outputs ─────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '../data')
fs.mkdirSync(outDir, { recursive: true })

// Public data — somente campos públicos, sem identificadores de fornecedor
fs.writeFileSync(
  path.join(outDir, 'static-data.json'),
  JSON.stringify({ produtos: produtosHashed, catalogos })
)

// Private map — gitignored, regenerated on every build
fs.writeFileSync(
  path.join(outDir, 'image-map.json'),
  JSON.stringify(imageMap)
)

const imgCount = Object.keys(imageMap).length
console.log(`Exportado: ${produtos.length} produtos, ${catalogos.length} catálogos → data/static-data.json`)
console.log(`Mapeadas: ${imgCount} imagens → data/image-map.json (privado)`)
