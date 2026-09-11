const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'Aco Mobilia 2025-7'").get()
const prod = db.prepare("SELECT id, imagens FROM produtos WHERE catalogo_id = ? AND nome = 'Mesa & Cadeira Athenas'").get(cat.id)

let imgs = JSON.parse(prod.imagens)

// Mover pag 5.png para o início
const idx = imgs.findIndex(url => url.includes('pag%205.png') || url.includes('pag 5.png'))
if (idx > 0) {
  const [capa] = imgs.splice(idx, 1)
  imgs.unshift(capa)
}

db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(imgs), prod.id)
console.log('Nova ordem:')
imgs.forEach((url, i) => console.log(`  ${i + 1}. ${decodeURIComponent(url.split('/').pop())}`))
db.close()
