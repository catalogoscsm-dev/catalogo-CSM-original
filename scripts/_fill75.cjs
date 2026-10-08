const db = require('better-sqlite3')('database/catalogo.db')

db.prepare(`
  UPDATE produtos SET
    dimensoes = 'A L55xA58xP55cm / B L45xA48xP45cm',
    material  = 'Cinamomo ou Jequitibá',
    acabamento = 'Castanho e aço carbono dourado'
  WHERE pagina = 75.1 AND nome = 'MESAS AUXILIARES LIVE'
`).run()

db.prepare(`
  UPDATE produtos SET
    dimensoes = 'A L63xA59xP56cm / B L48xA53xP43cm',
    material  = 'Cinamomo ou Jequitibá'
  WHERE pagina = 75.2 AND nome = 'MESAS AUXILIARES ORVALHO'
`).run()

console.log('OK')
db.close()
