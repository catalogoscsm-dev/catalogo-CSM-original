const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ARTESANO 2025/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ARTESANO 2025')

const produtos = [
  { pag: 124, nome: 'Escrivaninha',                       cod: '27999', dim: 'L139xA94,5xP61,6CM',  acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Escrivaninha' },
  { pag: 125, nome: 'Escrivaninha',                       cod: '28000', dim: 'L128xA99xP61,5CM',     acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Escrivaninha' },
  { pag: 126, nome: 'Estação de Trabalho',                cod: '28001', dim: 'L136xA75xP136CM',      acab: 'Hanover',                            cat: 'Escrivaninha' },
  { pag: 127, nome: 'Estação de Trabalho',                cod: '28002', dim: 'L120xA75xP120CM',      acab: 'Hanover',                            cat: 'Escrivaninha' },
  { pag: 128, nome: 'Mesa Escrivaninha',                  cod: '27988', dim: 'L136xA75xP60CM',       acab: 'Hanover',                            cat: 'Escrivaninha' },
  { pag: 129, nome: 'Gaveteiro Volante',                  cod: '27998', dim: 'L40xA58xP36CM',        acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Gaveteiro'    },
  { pag: 130, nome: 'Conjunto Mesa + Balcão',             cod: '28003', dim: 'L136xA78xP155,4CM',    acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Escrivaninha' },
  { pag: 131, nome: 'Conjunto Mesa Giratória + Balcão',   cod: '28005', dim: 'L147,6xA78xP112,8CM',  acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Escrivaninha' },
  { pag: 132, nome: 'Armário Alto',                       cod: '27996', dim: 'L80xA157,5xP36CM',     acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Armário'      },
  { pag: 133, nome: 'Armário Baixo',                      cod: '27997', dim: 'L80xA77,9xP36CM',      acab: 'Hanover - Branco / Hanover - Nero',  cat: 'Armário'      },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (9, ?, ?, ?, ?, ?, ?, ?)
`)

for (const p of produtos) {
  const destName = `pag${p.pag}-capa.png`
  fs.copyFileSync(path.join(SRC, `pag ${p.pag}`, 'capa.png'), path.join(DEST, destName))
  const imagens = JSON.stringify([`/imagens/ARTESANO 2025/${destName}`])
  stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, p.pag, imagens)
  console.log(`  ✓ pag ${p.pag} — ${p.nome} (${p.cod})`)
}

console.log('\nConcluído: 10 produtos inseridos.')
