const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbPath = path.join(__dirname, '..', 'database', 'catalogo.db')
const jsonPath = path.join(__dirname, '..', '..', 'catalogos_csm', '_output', 'aco-mobilia.json')

const db = new Database(dbPath)
const { produtos } = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const CATALOG_NOME = 'Aço Mobilia 2025-7'
const CATALOG_PASTA = 'Aco Mobilia 2025-7'
const CATALOG_ANO = 2025

function dimToStr(dim) {
  if (!dim) return null
  if (typeof dim === 'string') return dim
  const parts = []
  if (dim.tamanhos) parts.push(dim.tamanhos.join(' | '))
  if (dim.altura) parts.push(`A: ${dim.altura}`)
  if (dim.largura) parts.push(`L: ${dim.largura}`)
  if (dim.profundidade) parts.push(`P: ${dim.profundidade}`)
  if (dim.altura_assento) parts.push(`Assento: ${dim.altura_assento}`)
  if (dim.estrutura) parts.push(`Estrutura: ${dim.estrutura}`)
  if (dim.diametro) parts.push(`Ø: ${dim.diametro}`)
  return parts.join(' | ') || null
}

// Criar catálogo se não existir
let catalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!catalogo) {
  const result = db.prepare(
    'INSERT INTO catalogos (nome, pasta, ano) VALUES (?, ?, ?)'
  ).run(CATALOG_NOME, CATALOG_PASTA, CATALOG_ANO)
  catalogo = { id: result.lastInsertRowid }
  console.log(`Catálogo criado com id=${catalogo.id}`)
} else {
  console.log(`Catálogo existente id=${catalogo.id}`)
}

// Remover produtos existentes do catálogo (evitar duplicatas)
const deleted = db.prepare('DELETE FROM produtos WHERE catalogo_id = ?').run(catalogo.id)
console.log(`Removidos ${deleted.changes} produtos antigos`)

// Inserir todos os produtos
const insert = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, descricao, material, dimensoes, acabamento, pagina, imagens)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

let count = 0
for (const p of produtos) {
  const dimStr = dimToStr(p.dimensoes)
  insert.run(
    catalogo.id,
    p.nome,
    p.categoria || null,
    null,
    dimStr,
    p.acabamento || null,
    p.pagina || null,
    '[]'
  )
  count++
}

console.log(`Inseridos ${count} produtos para "${CATALOG_NOME}"`)
db.close()
