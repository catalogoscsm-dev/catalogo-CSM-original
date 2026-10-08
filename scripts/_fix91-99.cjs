const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('ARMIL COMPLETO 2024')
const byPag = (p) => db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(p, cat.id)

const updates = [
  { pag: 91,   nome: 'MESA DE JOGOS TEXAS',           dims: 'L134xA78xP134cm',       mat: 'Jequitibá',              acab: 'Nogueira e tecido verde',                      obs: 'A mesa acomoda 6 pessoas. Opções de tecido: preto, vermelho, verde ou azul. Medida do tabuleiro: 50x50cm.' },
  { pag: 91.1, nome: 'MESA DE JOGOS MÔNACO',          dims: 'L110xA75xP110cm',        mat: 'Jequitibá',              acab: 'Nogueira e tecido vermelho',                   obs: 'A mesa acomoda 4 pessoas. Opções de tecido: preto, vermelho, verde ou azul. Medida do tabuleiro: 32x32cm.' },
  { pag: 93,   nome: 'POLTRONA BURVICK',              dims: 'L63xA80xP66cm',          mat: 'Jequitibá',              acab: 'In natura e tela creme',                       obs: 'Disponível também em couro.' },
  { pag: 93.1, nome: 'POLTRONA CLOÉ',                 dims: 'L68xA78xP86cm',          mat: 'Jequitibá',              acab: 'In natura',                                    obs: 'Disponível também em tecido. Projeto assinado pela designer Juliana Desconsi.' },
  { pag: 94,   nome: 'POLTRONA FLU',                  dims: 'L72xA81xP83cm',          mat: 'Eucalipto',              acab: 'Naturalle',                                    obs: 'Disponível em couro. Encosto em corda de cor única e fibra de algodão, extremamente resistente. Projeto assinado pela designer Juliana Desconsi.' },
  { pag: 94.1, nome: 'POLTRONA HANNA',                dims: 'L64xA68xP64cm',          mat: 'Eucalipto',              acab: 'Naturalle',                                    obs: null },
  { pag: 94.2, nome: 'POLTRONA MONTANA',              dims: 'L74xA68xP75cm',          mat: 'Jequitibá',              acab: 'Nogueira',                                     obs: 'Couro especial tipo Soleta. Disponível também na cor café.' },
  { pag: 94.3, nome: 'POLTRONA STELLA',               dims: 'L75xA82xP73cm',          mat: 'Jequitibá',              acab: 'In natura, cinte em couro la paz camel',       obs: 'Assento e encosto disponíveis também em couro-cinta, apenas em couro. Fivela em material não oxidável.' },
  { pag: 95,   nome: 'POLTRONA ROTUNDA (tela sextavada)', dims: 'L73xA80xP70cm',      mat: 'Jequitibá',              acab: 'In natura e tela creme',                       obs: 'Disponível na versão giratória, com retorno. Acabamento apenas em tecido. Projeto assinado pela designer Juliana Desconsi.' },
  { pag: 95.1, nome: 'POLTRONA ROTUNDA (tricô)',      dims: 'L73xA80xP70cm',          mat: 'Jequitibá',              acab: 'In natura e encosto em tricô',                 obs: 'Disponível na versão giratória, com retorno. Acabamento apenas em tecido. Projeto assinado pela designer Juliana Desconsi.' },
  { pag: 95.2, nome: 'PUFF ROTUNDA',                  dims: 'L56xA40xP56cm',          mat: 'Jequitibá',              acab: 'In natura',                                    obs: 'Detalhe na base em tela sextavada ou tricê. Disponível apenas em tecido.' },
  { pag: 97,   nome: 'RECAMIER BALLET',               dims: 'L155xA48xP45cm',         mat: 'Eucalipto',              acab: 'Naturalle',                                    obs: 'Disponível também em tecido.' },
  { pag: 97.1, nome: 'RECAMIER ELOÁ',                 dims: 'L160xA45xP45cm',         mat: 'Eucalipto',              acab: 'Amazônia',                                     obs: null },
  { pag: 97.2, nome: 'RECAMIER ISIS',                 dims: 'L160xA46xP42cm',         mat: 'Cinamomo ou jequitibá',  acab: 'Cinamomo com acabamento naturalle',             obs: 'Disponível também em couro.' },
  { pag: 98,   nome: 'RECAMIER ITÁLIA',               dims: 'L120xA43xP46cm',         mat: 'Jequitibá',              acab: 'In natura',                                    obs: 'Disponível também em couro.' },
  { pag: 98.1, nome: 'RECAMIER GENOVA',               dims: 'L170xA48xP50cm',         mat: 'Eucalipto',              acab: 'Naturalle e tela creme',                       obs: 'Disponível também em couro.' },
  { pag: 98.2, nome: 'RECAMIER KAIAKI',               dims: 'L154xA44xP50cm',         mat: 'Jequitibá',              acab: 'In natura',                                    obs: 'Disponível também em couro.' },
  { pag: 99,   nome: 'RECAMIER MONTERREY',            dims: 'L69xA50xP45cm',          mat: 'Jequitibá',              acab: 'Envelhecido',                                  obs: null },
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
