const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

// Busca o produto Duna Carrinho (página 7) do ABV 2025
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = 'ABV 2025'").get()
if (!cat) { console.error('Catálogo ABV 2025 não encontrado'); process.exit(1) }

const prod = db.prepare("SELECT id FROM produtos WHERE catalogo_id = ? AND nome = 'Duna' AND pagina = 7").get(cat.id)
if (!prod) { console.error('Produto Duna pág 7 não encontrado'); process.exit(1) }

// Vincula as imagens do teste ao produto real
const encode = (catalog, file) =>
  `/api/imagem/${encodeURIComponent(catalog)}/imagens%20dos%20produtos/${encodeURIComponent(file)}`

const imagens = [
  encode('ABV 2025', 'ABV 2025 — sub [2]_pag2_recorte_714161.png'),
  encode('ABV 2025', 'ABV 2025 — sub [2]_pag_001.png'),
]

db.prepare("UPDATE produtos SET imagens = ? WHERE id = ?").run(JSON.stringify(imagens), prod.id)

console.log(`OK: imagens vinculadas ao produto Duna (id=${prod.id})`)
console.log(`    Acesse: http://localhost:3000/produto/${prod.id}`)
db.close()
