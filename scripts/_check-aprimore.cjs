const Database = require('better-sqlite3')
const db = new Database('database/catalogo.db')
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta LIKE '%aprimore%' OR pasta LIKE '%Aprimore%'").get()
console.log('catalogo_id:', cat.id)
const produtos = db.prepare('SELECT id, nome, descricao, dimensoes, pagina FROM produtos WHERE catalogo_id = ? ORDER BY pagina').all(cat.id)
produtos.forEach(p => {
  console.log(`pag ${p.pagina} | nome: "${p.nome}" | desc: "${p.descricao}" | dim: "${p.dimensoes}"`)
})
db.close()
