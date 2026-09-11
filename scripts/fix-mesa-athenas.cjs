const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'Aco Mobilia 2025-7'").get()

const prods = db.prepare('SELECT id, nome, imagens FROM produtos WHERE catalogo_id = ? AND pagina = 4').all(cat.id)
console.log('Produtos na pág 4:')
prods.forEach(p => {
  const imgs = JSON.parse(p.imagens || '[]')
  console.log(`  [${p.id}] ${p.nome} — ${imgs.length} imagem(ns)`)
  imgs.forEach(img => console.log('    -', img.split('/').pop()))
})

// Separar: cadeira fica com cadeiras+detalhe, mesa fica com a imagem da mesa
const cadeira = prods.find(p => p.nome.toLowerCase().includes('cadeira'))
const mesa    = prods.find(p => p.nome.toLowerCase().includes('mesa'))

if (!cadeira || !mesa) {
  console.log('Não encontrou cadeira ou mesa na pág 4'); db.close(); process.exit(1)
}

const cadeiraImgs = JSON.parse(cadeira.imagens || '[]')
const mesaImgs    = JSON.parse(mesa.imagens    || '[]')

// Encontrar a imagem da mesa na lista da cadeira
const mesaImg    = cadeiraImgs.find(img => img.includes('mesa'))
const restantes  = cadeiraImgs.filter(img => !img.includes('mesa'))

if (!mesaImg) {
  console.log('Imagem da mesa não encontrada nas imgs da cadeira'); db.close(); process.exit(0)
}

// Atualizar cadeira (sem a imagem da mesa)
db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(restantes), cadeira.id)

// Atualizar mesa (com a imagem da mesa como capa + imagens existentes)
const novasMesaImgs = [mesaImg, ...mesaImgs.filter(img => !img.includes('mesa'))]
db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(novasMesaImgs), mesa.id)

console.log('\nDepois da correção:')
console.log(`  Cadeira: ${restantes.length} img(ns)`)
restantes.forEach(img => console.log('    -', img.split('/').pop()))
console.log(`  Mesa: ${novasMesaImgs.length} img(ns)`)
novasMesaImgs.forEach(img => console.log('    -', img.split('/').pop()))

db.close()
