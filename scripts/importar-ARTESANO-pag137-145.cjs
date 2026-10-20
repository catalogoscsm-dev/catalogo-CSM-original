const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ARTESANO 2025/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ARTESANO 2025')

// pag 144 pulada (Mesa Híbrida — mesmos códigos 25468/25469 da pag 143, sem capa.png)
// pag 146, 149-157 puladas (sem ficha técnica)
// pag 162, 163, 165, 167, 168 puladas (pastas vazias)
const produtos = [
  { pag: 137, nome: 'Escrivaninha',             cod: '26106', dim: 'L150xA77,5xP60CM',                            acab: '', cat: 'Escrivaninha'      },
  { pag: 138, nome: 'Escrivaninha',             cod: '26105', dim: 'L125xA77,5xP63,5CM',                          acab: '', cat: 'Escrivaninha'      },
  { pag: 141, nome: 'Mesa Híbrida Dinâmica',    cod: '25466', dim: '160cm-L160xA74xP70CM|180cm-L180xA74xP70CM',   acab: '', cat: 'Mesa de Escritório' },
  { pag: 142, nome: 'Mesa Canaletto Dinâmica',  cod: '25470', dim: '160cm-L160xA74xP70CM|180cm-L180xA74xP70CM',   acab: '', cat: 'Mesa de Escritório' },
  { pag: 143, nome: 'Mesa Híbrida',             cod: '25468', dim: '160cm-L160xA74xP70CM|180cm-L180xA74xP70CM',   acab: '', cat: 'Mesa de Escritório' },
  { pag: 145, nome: 'Plataforma Híbrida Dupla', cod: '25684', dim: '120cm-L120xA74xP120CM|136cm-L136xA74xP120CM', acab: '', cat: 'Mesa de Escritório' },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (9, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0

for (const p of produtos) {
  const destName = `pag${p.pag}-capa.png`
  fs.copyFileSync(path.join(SRC, `pag ${p.pag}`, 'capa.png'), path.join(DEST, destName))
  const imagens = JSON.stringify([`/imagens/ARTESANO 2025/${destName}`])
  stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, p.pag, imagens)
  console.log(`  ✓ pag ${p.pag} — ${p.nome} (${p.cod})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
