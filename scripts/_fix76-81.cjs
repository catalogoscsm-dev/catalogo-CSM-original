const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('ARMIL COMPLETO 2024')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)

const updates = [
  // pag 76 — imagem mostra PÉTALA (produto que era Pitaya foi reorganizado p/ 76b)
  { pag: 76,   nome: 'MESAS AUXILIARES PÉTALA',         dims: 'P: L30xA48xP30cm / M: L35xA53xP35cm / G: L40xA58xP40cm', mat: 'Jequitibá, cinamomo ou carvalho',        acab: 'Naturalle e aço carbono dourado',              obs: null },
  { pag: 76.1, nome: 'MESA AUXILIAR PITAYA',             dims: 'L55xA50xP55cm',                                           mat: 'Eucalipto com tampo em cinamomo',         acab: 'Naturalle',                                    obs: null },
  { pag: 76.2, nome: 'MESA AUXILIAR RIGA',               dims: 'L60xA60xP60cm',                                           mat: 'Jequitibá',                               acab: 'Ebanizado',                                    obs: null },
  { pag: 78,   nome: 'MESAS AUXILIARES STAR',            dims: 'P: L40xA63xP40cm / M: L35xA56xP35cm / G: L30xA49xP30cm', mat: 'Cinamomo ou jequitibá',                   acab: 'In natura e aço carbono preto',                obs: null },
  { pag: 78.1, nome: 'MESA AUXILIAR VERSÁTILE',          dims: 'L62xA52xP46cm',                                           mat: 'Cinamomo ou jequitibá',                   acab: 'Naturalle e aço carbono preto',                obs: null },
  { pag: 78.2, nome: 'MESA AUXILIAR ZOÉ',                dims: 'L35xA67xP44cm',                                           mat: 'Cinamomo',                                acab: 'Amazônia, aço carbono champagne e couro preto', obs: 'Bandeja em madeira maciça; disponível em aço carbono preto, dourado ou champagne; detalhe em couro disponível nas cores conforme catálogo.' },
  { pag: 79,   nome: 'MESA DE CENTRO BOSSA retangular',  dims: 'L140xA32xP70cm',                                          mat: 'Jequitibá',                               acab: 'In natura',                                    obs: null },
  { pag: 79.1, nome: 'MESAS DE CENTRO BOSSA redonda',   dims: 'A: L78xA39xP78cm / B: L95xA32xP96cm',                     mat: 'Jequitibá',                               acab: 'In natura',                                    obs: null },
  { pag: 79.2, nome: 'MESA DE CENTRO CIELO',             dims: 'L150xA32xP71cm',                                          mat: 'Eucalipto',                               acab: 'Naturalle e aço carbono preto',                obs: 'Tampo também em madeira maciça.' },
  { pag: 80,   nome: 'MESA DE CENTRO DONATELLE',         dims: 'L130xA40xP70cm',                                          mat: 'Jequitibá',                               acab: 'In natura e tela creme',                       obs: 'Tela disponível nas cores creme ou em ebanizado.' },
  { pag: 80.1, nome: 'MESAS DE CENTRO EDEN',             dims: 'A: L80xA40xP80cm / B: L80xA33xP80cm',                     mat: 'Jequitibá',                               acab: 'In natura',                                    obs: 'Tampos em vidro transparente.' },
  { pag: 80.2, nome: 'MESAS DE CENTRO ELARA',            dims: 'A: L60xA41xP60cm / B: L80xA36xP80cm',                     mat: 'Cinamomo, jequitibá ou lâmina de carvalho', acab: 'Naturalle',                                  obs: null },
  { pag: 81,   nome: 'MESA DE CENTRO FUSTO',             dims: 'L100xA36xP100cm',                                         mat: 'Jequitibá',                               acab: 'In natura',                                    obs: 'Tampos em vidro transparente; peça de fixação na base, disponível apenas em alumínio cromado.' },
  { pag: 81.1, nome: 'MESAS DE CENTRO GAIA',             dims: 'A: L80xA40xP80cm / B: L80xA34xP80cm',                     mat: 'Cinamomo ou jequitibá',                   acab: 'Castanho',                                     obs: 'Tampos podem ser madeirados ou com espelho.' },
  { pag: 81.2, nome: 'MESAS DE CENTRO JADE',             dims: 'A: L60xA38xP60cm / B: L82xA32xP82cm',                     mat: 'Cinamomo',                                acab: 'Naturalle',                                    obs: 'Peça em madeira maciça.' },
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
