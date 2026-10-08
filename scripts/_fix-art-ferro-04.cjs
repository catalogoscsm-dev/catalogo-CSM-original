const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('Art Ferro 2024-25')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)

const updates = [
  { pag: 4, nome: 'BARROCO', dims: 'Sofá-L200xA86xP90cm | Poltrona-L90xA86xP90cm', mat: null, acab: null, obs: 'Assento: A44cm' },
]

const stmt = db.prepare('UPDATE produtos SET nome=?, dimensoes=?, material=?, acabamento=?, texto_livre=? WHERE id=?')

const ids = []
for (const u of updates) {
  const row = byPag(u.pag)
  if (!row) { console.log(`AVISO: pag ${u.pag} não encontrada`); continue }
  stmt.run(u.nome, u.dims, u.mat, u.acab, u.obs, row.id)
  ids.push(row.id)
  console.log(`pag ${u.pag} #${row.id} → ${u.nome} ✓`)
}

db.close()
console.log('\nIDs para curadoria:', ids.join(','))
