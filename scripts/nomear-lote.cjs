const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const nomes = [
  { pagina: '60b', nome: 'CAMA NEO INDIANO' },
  { pagina: '60c', nome: 'CAMA SICILIANO' },
  { pagina: '63b', nome: 'MESA DE CABECEIRA BOSCO' },
  { pagina: '63c', nome: 'MESA DE CABECEIRA BRISA' },
  { pagina: '64b', nome: 'MESA DE CABECEIRA CIPÓ' },
  { pagina: '64c', nome: 'MESA DE CABECEIRA EROS' },
  { pagina: '65b', nome: 'MESA DE CABECEIRA ISIS' },
  { pagina: '65c', nome: 'MESA DE CABECEIRA KIEV' },
  { pagina: '67b', nome: 'MESA DE CABECEIRA LILLE' },
  { pagina: '67c', nome: 'MESA DE CABECEIRA MALTA' },
  { pagina: '68b', nome: 'MESA DE CABECEIRA OREGON RETANGULAR' },
  { pagina: '68c', nome: 'MESA DE CABECEIRA OREGON REDONDA' },
  { pagina: '69b', nome: 'MESA DE CABECEIRA PETRA' },
  { pagina: '69c', nome: 'MESA DE CABECEIRA ROMA' },
  { pagina: '70b', nome: 'MESA DE CABECEIRA ZANE PEQUENA' },
  { pagina: '70c', nome: 'MESA DE CABECEIRA ZANE GRANDE' },
  { pagina: '71b', nome: 'MESA DE CABECEIRA MILAN' },
  { pagina: '71c', nome: 'MESA DE CABECEIRA SICILIANO' },
  { pagina: '73b', nome: 'MESAS AUXILIARES BIA' },
  { pagina: '73c', nome: 'MESA AUXILIAR BOSSA' },
]

const findByPlaceholder = db.prepare(`SELECT id, nome FROM produtos WHERE nome LIKE ?`)

let ok = 0
for (const { pagina, nome } of nomes) {
  const pattern = `%(produto pag ${pagina}%`
  const prod = findByPlaceholder.get(pattern)
  if (!prod) {
    console.log(`⚠ Não encontrado: pag ${pagina}`)
    continue
  }
  db.prepare(`UPDATE produtos SET nome = ? WHERE id = ?`).run(nome, prod.id)
  console.log(`✓ pag ${pagina} → ${nome}`)
  ok++
}

console.log(`\n${ok}/${nomes.length} produtos atualizados.`)
db.close()
