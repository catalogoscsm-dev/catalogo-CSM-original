const db = require('better-sqlite3')('database/catalogo.db')
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'Aco Mobilia 2025-7'").get()
const prods = db.prepare("SELECT nome, imagens FROM produtos WHERE catalogo_id = ? AND imagens != '[]'").all(cat.id)
prods.forEach(r => {
  const arr = JSON.parse(r.imagens)
  console.log(r.nome, '->', arr[0])
})
db.close()
