// Run this after adding new products: npm run export-data
const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })

const produtos = db.prepare(`
  SELECT p.*, c.nome as catalogo_nome, c.pasta as catalogo_pasta
  FROM produtos p
  JOIN catalogos c ON p.catalogo_id = c.id
  ORDER BY p.id
`).all().map(r => ({ ...r, imagens: JSON.parse(r.imagens || '[]') }))

const catalogos = db.prepare(`
  SELECT c.*, COUNT(p.id) as total_produtos
  FROM catalogos c
  LEFT JOIN produtos p ON p.catalogo_id = c.id
  GROUP BY c.id
  ORDER BY c.nome
`).all()

db.close()

const outDir = path.join(__dirname, '../data')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'static-data.json'), JSON.stringify({ produtos, catalogos }))

console.log(`Exportado: ${produtos.length} produtos, ${catalogos.length} catálogos → data/static-data.json`)
