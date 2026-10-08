const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta=?').get('ARMIL COMPLETO 2024')
const pag77b = db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(77.1, cat.id)
const pag77c = db.prepare('SELECT id, nome FROM produtos WHERE pagina=? AND catalogo_id=?').get(77.2, cat.id)

console.log('77b:', pag77b)
console.log('77c:', pag77c)

const stmt = db.prepare('UPDATE produtos SET nome=?, dimensoes=?, material=?, acabamento=?, texto_livre=? WHERE id=?')

if (pag77b) {
  stmt.run('MESA AUXILIAR SLIM', 'L55xA62xP50cm', 'Jequitibá', 'Nogueira e laca fosca off-white', 'Laca disponível apenas nas partes já com o acabamento.', pag77b.id)
  console.log('77b atualizado OK')
}
if (pag77c) {
  stmt.run('MESAS AUXILIARES SOLLO', 'A: L44xA65xP44cm / B: L44xA55xP44cm', 'Cinamomo ou jequitibá', 'Nogueira e aço carbono preto', 'Tampos podem ser madeirados ou com espelho.', pag77c.id)
  console.log('77c atualizado OK')
}

db.close()
