const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'Aco Mobilia 2025-7'").get()
const result = db.prepare(
  "UPDATE produtos SET nome = 'Cadeira Atrani Tapeçada' WHERE catalogo_id = ? AND nome LIKE '%Atrani%'"
).run(cat.id)
console.log('Linhas atualizadas:', result.changes)
const check = db.prepare("SELECT nome FROM produtos WHERE catalogo_id = ? AND nome LIKE '%Atrani%'").get(cat.id)
console.log('Nome agora:', check?.nome)
db.close()
