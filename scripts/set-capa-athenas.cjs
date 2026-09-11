const Database = require('better-sqlite3')
const path = require('path')

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'Aco Mobilia 2025-7'").get()
const prod = db.prepare("SELECT id, imagens FROM produtos WHERE catalogo_id = ? AND nome = 'Mesa & Cadeira Athenas'").get(cat.id)

let imgs = JSON.parse(prod.imagens)
const idx = imgs.findIndex(u => u.includes('pag%205.png') || u.includes('pag 5.png'))

if (idx > 0) {
  const [url] = imgs.splice(idx, 1)
  imgs.unshift(url)
  db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(imgs), prod.id)
  console.log('Capa definida:', decodeURIComponent(imgs[0].split('/').pop()))
} else {
  console.log(idx === 0 ? 'Já é a capa.' : 'Arquivo não encontrado.')
}

db.close()
