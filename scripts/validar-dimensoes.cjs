// Valida o campo "dimensoes" de TODOS os produtos do banco com o parser do site.
// Uso: node scripts/validar-dimensoes.cjs        (ou: npm run validar-dimensoes)
// Saída 0 = tudo reconhecido; saída 1 = lista os produtos que o site mostraria como texto cru.
const Database = require('better-sqlite3')
const path = require('path')
const { statusDimensoes } = require('./_dimensoes-guard.cjs')

const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })
const rows = db.prepare(`SELECT p.id, p.nome, p.dimensoes, COALESCE(c.nome,'(sem catálogo)') AS catalogo
  FROM produtos p LEFT JOIN catalogos c ON c.id = p.catalogo_id ORDER BY c.nome, p.id`).all()
db.close()

const cont = { ok: 0, vazio: 0, descritivo: 0, invalido: 0 }
const ruins = {}
for (const r of rows) {
  const s = statusDimensoes(r.dimensoes)
  cont[s]++
  if (s === 'invalido') (ruins[r.catalogo] ??= []).push(r)
}
console.log(`Produtos: ${rows.length} | tabela: ${cont.ok} | vazio: ${cont.vazio} | texto descritivo (sem dígitos): ${cont.descritivo} | INVÁLIDOS: ${cont.invalido}`)
if (!cont.invalido) process.exit(0)

for (const [cat, lista] of Object.entries(ruins)) {
  console.error(`\n${cat}: ${lista.length}`)
  for (const r of lista) console.error(`  id ${r.id} ${r.nome} :: ${r.dimensoes}`)
}
console.error('\nFormato oficial: docs/FORMATO-DIMENSOES.md')
process.exit(1)
