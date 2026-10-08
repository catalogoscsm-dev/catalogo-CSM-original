const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('ARMIL COMPLETO 2024')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)

const updates = [
  { pag: 82,   nome: 'MESAS DE CENTRO LAGUS',                    dims: 'A: L80xA38xP80cm / B: L80xA33xP80cm',                              mat: 'Jequitibá',                              acab: 'In natura e aço carbono preto',                              obs: null },
  { pag: 82.1, nome: 'MESAS DE CENTRO MARE',                     dims: 'A: L60xA35xP60cm / B: L80xA20xP80cm',                              mat: 'Cinamomo ou jequitibá',                  acab: 'In natura e vidro lacca fosca preta, pés em aço carbono preto', obs: 'Tampo também pode ser em madeira; pintura em lace disponível nas cores.' },
  { pag: 82.2, nome: 'MESAS DE CENTRO METEORO',                  dims: 'A: L93xA37xP67cm / B: L110xA32xP84cm',                            mat: 'Jequitibá, cinamomo ou carvalho',         acab: 'Naturalle',                                                  obs: 'Pés em aço dourado; revestimento em lâmina de madeira.' },
  { pag: 83,   nome: 'MESA DE CENTRO MOOI - 120cm',              dims: 'L120xA35xP120cm',                                                  mat: 'Eucalipto',                              acab: 'Naturalle',                                                  obs: 'Tampo em vidro 8mm.' },
  { pag: 83.1, nome: 'MESA DE CENTRO MOOI - 100cm',              dims: 'L100xA30xP100cm',                                                  mat: 'Eucalipto',                              acab: 'Naturalle',                                                  obs: 'Tampo em vidro 8mm.' },
  { pag: 83.2, nome: 'MESAS DE CENTRO NOMA',                     dims: 'A: L107xA39xP82cm / B: L90xA33xP68cm',                            mat: 'Eucalipto',                              acab: 'Naturalle e pés em alumínio cromado',                        obs: 'Tampos em madeira maciça; pés podem ser em alumínio preto, dourado ou champagne.' },
  { pag: 84,   nome: 'MESAS DE CENTRO ORVALHO',                  dims: 'A: L73xA39xP66cm / B: L93xA34xP84cm',                            mat: 'Cinamomo, jequitibá ou nogueira',        acab: null,                                                         obs: null },
  { pag: 84.1, nome: 'MESAS DE CENTRO PIEMONT',                  dims: 'A: L120xA37xP84cm / B: L100xA37xP68cm',                          mat: 'Cinamomo ou jequitibá',                  acab: 'Naturalle',                                                  obs: null },
  { pag: 84.2, nome: 'MESAS DE CENTRO PITAYA',                   dims: 'A: L70xA38xP70cm / B: L100xA34xP100cm',                          mat: 'Eucalipto',                              acab: 'Naturalle',                                                  obs: 'Vidro do tampo tem 8mm.' },
  { pag: 85,   nome: 'MESA DE CENTRO RIGA retangular',           dims: 'L140xA30xP65cm',                                                  mat: 'Jequitibá',                              acab: 'Ebanizado',                                                  obs: null },
  { pag: 85.1, nome: 'MESAS DE CENTRO RIGA redondas',            dims: 'A: L75xA36xP75cm / B: L90xA30xP90cm',                            mat: 'Jequitibá',                              acab: 'Ebanizado',                                                  obs: null },
  { pag: 85.2, nome: 'MESAS DE CENTRO SILKY',                    dims: 'A: L90xA38xP90cm / B: L90xA32xP90cm',                            mat: 'Jequitibá',                              acab: 'Ebanizado',                                                  obs: null },
  { pag: 86,   nome: 'MESAS DE CENTRO SOLLO',                    dims: 'A: L64xA40xP64cm / B: L84xA30xP84cm',                            mat: 'Cinamomo ou jequitibá',                  acab: 'Nogueira e aço carbono preto',                               obs: 'Tampos podem ser madeirados ou com espelho.' },
  { pag: 86.1, nome: 'MESAS DE CENTRO VÊNUS',                    dims: 'A: L67xA35xP63cm / B: L82xA31xP64cm',                            mat: 'Cinamomo ou jequitibá',                  acab: 'Ebanizado e aço carbono dourado',                            obs: null },
  { pag: 86.2, nome: 'MESA DE JANTAR CAPRI',                     dims: 'A: L275xA78xP120cm / B: L240xA78xP120cm / C: L220xA78xP110cm',   mat: 'Cinamomo ou jequitibá',                  acab: 'Naturalle e aço carbono preto',                              obs: null },
  { pag: 87,   nome: 'MESA DE JANTAR CARIBE',                    dims: 'A: L130xA77xP130cm / B: L150xA77xP150cm',                        mat: 'Eucalipto',                              acab: 'Naturalle',                                                  obs: 'Tampo em madeira maciça, disponível também em vidro laqueado.' },
  { pag: 87.1, nome: 'MESA DE JANTAR FAMILY (tampo madeira maciça)', dims: 'A: L248xA76xP120cm / B: L228xA76xP110cm / C: L208xA76xP100cm', mat: 'Base em cinamomo e tampo em eucalipto', acab: 'Naturalle',                                                  obs: null },
  { pag: 87.2, nome: 'MESA DE JANTAR FAMILY (tampo MDF)',        dims: 'A: L248xA76xP120cm / B: L228xA76xP110cm / C: L208xA76xP100cm',   mat: 'Base e tampo em MDF laminado de cinamomo', acab: 'Naturalle',                                                obs: null },
  { pag: 88,   nome: 'MESA DE JANTAR DUOMO',                     dims: 'P: L150xA76xP150cm / G: L180xA76xP180cm',                        mat: 'Jequitibá',                              acab: 'In natura',                                                  obs: 'Giratório em vidro laqueado ou em madeira, no centro. Laca disponível apenas nas partes já com o acabamento.' },
  { pag: 89,   nome: 'MESA DE JANTAR ISLA',                      dims: 'A: L270xA77xP110cm / B: L230xA77xP110cm / C: L200xA77xP100cm / D: L180xA77xP100cm', mat: 'Base em eucalipto e tampo em cinamomo ou carvalho', acab: 'Naturalle', obs: null },
  { pag: 89.1, nome: 'MESA DE JANTAR TRIPLÊS',                   dims: 'A: L270xA75xP120cm / B: L240xA75xP120cm / C: L220xA75xP120cm',   mat: 'Cinamomo ou jequitibá',                  acab: 'Cinamomo com marchetaria e acabamento naturalle, pés em aço carbono preto', obs: 'Tampo pode ser com laminação normal, sem marchetaria. Projeto assinado pela designer Juliana Desconsi.' },
  { pag: 90,   nome: 'MESA DE JANTAR VELÚRIA',                   dims: 'A: L270xA76xP120cm / B: L240xA78xP120cm / C: L220xA78xP110cm',   mat: 'Cinamomo ou jequitibá',                  acab: 'Naturalle, base em concreto polido e haste em aço carbono preto', obs: null },
  { pag: 90.1, nome: 'MESA DE JANTAR CÓRDOBA',                   dims: 'A: L240xA79xP110cm / M: L220xA79xP110cm / P: L170xA79xP100cm',   mat: 'Jequitibá',                              acab: 'Envelhecido',                                                obs: null },
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
