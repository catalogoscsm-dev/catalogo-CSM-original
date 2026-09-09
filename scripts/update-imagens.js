const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const catalogo = 'ABV 2025'
const produtoNome = 'Sofá Retrátil Vermont'

const encode = (catalog, file) =>
  `/api/imagem/${encodeURIComponent(catalog)}/imagens%20dos%20produtos/${encodeURIComponent(file)}`

const imagens = [
  encode(catalogo, 'ABV 2025 — sub [2]_pag2_recorte_714161.png'), // recorte → card
  encode(catalogo, 'ABV 2025 — sub [2]_pag_001.png'),              // página inteira → foto adicional
]

const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogo)
if (!cat) { console.error('Catálogo não encontrado'); process.exit(1) }

const prod = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND nome = ?').get(cat.id, produtoNome)
if (!prod) { console.error('Produto não encontrado'); process.exit(1) }

db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(imagens), prod.id)

console.log(`✓ Imagens atualizadas no produto "${produtoNome}"`)
console.log(imagens.forEach(i => console.log(' -', i)))
db.close()
