const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('Art Ferro 2024-25')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)
const stmt = db.prepare('UPDATE produtos SET nome=?, dimensoes=?, material=?, acabamento=?, texto_livre=? WHERE id=?')

const updates = [
  // pag 18 — DUBLIN: Sofá L200xA84xP72cm / Poltrona L79xA84xP72cm
  { pag: 18, nome: 'DUBLIN',   dims: 'Sofá-L200xA84xP72cm | Poltrona-L79xA84xP72cm',                                           mat: null, acab: null, obs: 'Assento: A46cm' },
  // pag 19 — PORTO: Sofá 2L L170xA84xP75cm / Poltrona L79xA84xP75cm
  { pag: 19, nome: 'PORTO',    dims: 'Sofá-L170xA84xP75cm | Poltrona-L79xA84xP75cm',                                           mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 20 — AUSTIN: sofá modular (canto, central, braço, mesa)
  { pag: 20, nome: 'AUSTIN',   dims: 'Canto-L80xA88xP80cm | Central-L90xA88xP80cm | Braço-L150xA88xP80cm | Mesa-L90xA45xP80cm', mat: null, acab: null, obs: 'Assento: A45cm. Sistema modular — combine os módulos livremente.' },
  // pag 21 — JANGADA: Sofá L150xA88xP80cm / Poltrona L90xA88xP80cm
  { pag: 21, nome: 'JANGADA',  dims: 'Sofá-L150xA88xP80cm | Poltrona-L90xA88xP80cm',                                          mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 22 — OSLO: Sofá L240xA82xP82cm / Poltrona L90xA82xP82cm
  { pag: 22, nome: 'OSLO',     dims: 'Sofá-L240xA82xP82cm | Poltrona-L90xA82xP82cm',                                          mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 23 — HAVANA: chaise/daybed L90xA82xP82cm
  { pag: 23, nome: 'HAVANA',   dims: 'L90xA82xP82cm',                                                                          mat: null, acab: null, obs: 'Assento: A45cm' },
  // pag 24 — AREZZO: sofá ninho redondo Ø150cm externo / Ø105cm assento / A86cm
  { pag: 24, nome: 'AREZZO',   dims: 'L150xA86cm',                                                                             mat: null, acab: null, obs: 'Diâmetro externo: 150cm / Diâmetro assento: 105cm' },
  // pag 25 — MILANO: cadeira balanço suspensa L95xA105xP110cm + suporte L137xA208cm
  { pag: 25, nome: 'MILANO',   dims: 'Cadeira-L95xA105xP110cm | Suporte-L137xA208cm',                                         mat: null, acab: null, obs: null },
  // pag 26 — TERRA: pod suspenso L157xA110cm + suporte L140xA210cm
  { pag: 26, nome: 'TERRA',    dims: 'Cadeira-L157xA110cm | Suporte-L140xA210cm',                                              mat: null, acab: null, obs: null },
  // pag 27 — BALANÇO: esfera suspensa L110xA110xP76cm + suporte L137xA208cm
  { pag: 27, nome: 'BALANÇO',  dims: 'Cadeira-L110xA110xP76cm | Suporte-L137xA208cm',                                         mat: null, acab: null, obs: null },
  // pag 28 — VENEZA: balanço trapézio assento L85xA67xP85cm + suporte L110xA194xP137cm
  { pag: 28, nome: 'VENEZA',   dims: 'Assento-L85xA67xP85cm | Suporte-L110xA194xP137cm',                                      mat: null, acab: null, obs: null },
  // pag 29 — FOLHA: esfera suspensa L110xA110xP76cm + suporte L137xA208cm
  { pag: 29, nome: 'FOLHA',    dims: 'Cadeira-L110xA110xP76cm | Suporte-L137xA208cm',                                         mat: null, acab: null, obs: null },
]

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
