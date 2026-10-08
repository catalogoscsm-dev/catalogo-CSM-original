const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('Art Ferro 2024-25')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)

const updates = [
  // pag 05 — BRISA: Sofá L200xA84xP66cm / Poltrona L73xA84xP66cm
  { pag: 5,  nome: 'BRISA',     dims: 'Sofá-L200xA84xP66cm | Poltrona-L73xA84xP66cm',                          mat: null, acab: null, obs: 'Assento: A43cm' },
  // pag 06 — AGATA: Sofá L200xA80xP80cm / Poltrona L85xA80xP80cm
  { pag: 6,  nome: 'AGATA',     dims: 'Sofá-L200xA80xP80cm | Poltrona-L85xA80xP80cm',                          mat: null, acab: null, obs: 'Assento: A46cm' },
  // pag 07 — MARIAH: Sofá 2L L180xA83xP76cm / Poltrona L76xA83xP76cm
  { pag: 7,  nome: 'MARIAH',    dims: 'Sofá-L180xA83xP76cm | Poltrona-L76xA83xP76cm',                          mat: null, acab: null, obs: 'Assento: A43cm' },
  // pag 08 — REQUINTE: Sofá L162xA83xP80cm / Poltrona L85xA83xP80cm
  { pag: 8,  nome: 'REQUINTE',  dims: 'Sofá-L162xA83xP80cm | Poltrona-L85xA83xP80cm',                          mat: null, acab: null, obs: 'Assento: A46cm' },
  // pag 09 — VALENTINA: Sofá 3L/2L e Poltrona
  { pag: 9,  nome: 'VALENTINA', dims: 'Sofá 3L-L233xA87xP70cm | Sofá 2L-L193xA87xP70cm | Poltrona-L74xA87xP70cm', mat: null, acab: null, obs: 'Assento: A49cm' },
  // pag 10 — DUNA: sofá curvo único
  { pag: 10, nome: 'DUNA',      dims: 'L235xA96xP110cm',                                                        mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 11 — ODHARA: sofá curvo único (mesmas dimensões da linha)
  { pag: 11, nome: 'ODHARA',    dims: 'L235xA96xP110cm',                                                        mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 12 — ELEGANCE: Sofá L197xA85xP88cm / Poltrona L91xA85xP88cm
  { pag: 12, nome: 'ELEGANCE',  dims: 'Sofá-L197xA85xP88cm | Poltrona-L91xA85xP88cm',                          mat: null, acab: null, obs: 'Assento: A42cm' },
  // pag 13 — SUMMER: sem ficha, pular
  // pag 14 — CONJUNTO: Sofá L175xA90xP85cm / Poltrona L85xA90xP85cm
  { pag: 14, nome: 'CONJUNTO',  dims: 'Sofá-L175xA90xP85cm | Poltrona-L85xA90xP85cm',                          mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 15 — DALLAS: Sofá L180xA87xP82cm / Poltrona L71xA87xP82cm
  { pag: 15, nome: 'DALLAS',    dims: 'Sofá-L180xA87xP82cm | Poltrona-L71xA87xP82cm',                          mat: null, acab: null, obs: 'Assento: A47cm' },
  // pag 16 — HELENA: Sofá L190xA82xP80cm / Poltrona L80xA82xP80cm
  { pag: 16, nome: 'HELENA',    dims: 'Sofá-L190xA82xP80cm | Poltrona-L80xA82xP80cm',                          mat: null, acab: null, obs: 'Assento: A42cm' },
  // pag 17 — MARROCOS: sem ficha, pular
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
