const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })

const nomes = ['Veredas', 'Vitta', 'Palermo', 'Point', 'Sonic', 'Indianápolis']
for (const nome of nomes) {
  const r = db.prepare("SELECT p.nome, c.nome as cat, c.pasta FROM produtos p JOIN catalogos c ON p.catalogo_id=c.id WHERE p.nome LIKE ? LIMIT 1").get(`%${nome}%`)
  if (r) console.log(`${r.nome.padEnd(20)} → ${r.cat} (${r.pasta})`)
}
db.close()
