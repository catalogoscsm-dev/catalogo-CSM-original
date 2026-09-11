const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const CATALOG_PASTA = 'Aco Mobilia 2025-7'
const SRC_DIR  = `C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos`
const DEST_DIR = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)

fs.mkdirSync(DEST_DIR, { recursive: true })

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)

// Todas as imagens da pasta (exceto arquivos indesejados)
const SKIP = new Set([])
const arquivos = fs.readdirSync(SRC_DIR).filter(f => {
  const ext = path.extname(f).toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp', '.jfif'].includes(ext)
})

// Copiar tudo para public e montar URLs
const imagens = []
for (const arq of arquivos) {
  const src  = path.join(SRC_DIR, arq)
  const dest = path.join(DEST_DIR, arq)
  fs.copyFileSync(src, dest)
  const url = `/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(arq)}`
  imagens.push(url)
  console.log(`Copiado: ${arq}`)
}

// Ordenar: recorte de cadeiras primeiro (capa), depois detalhe, mesa, foto ambiente, jfif
imagens.sort((a, b) => {
  const order = (url) => {
    const f = decodeURIComponent(url.split('/').pop())
    if (f.includes('cadeiras')) return 0
    if (f.includes('mesa'))     return 1
    if (f.includes('detalhe'))  return 2
    if (f === 'pag 5.png')      return 3
    return 4
  }
  return order(a) - order(b)
})

// Encontrar Cadeira Athenas (pagina=4) e renomear para produto combinado
const cadeira = db.prepare(
  "SELECT id FROM produtos WHERE catalogo_id = ? AND nome LIKE '%Cadeira Athenas%'"
).get(cat.id)

const mesa = db.prepare(
  "SELECT id FROM produtos WHERE catalogo_id = ? AND nome LIKE '%Mesa Athenas%'"
).get(cat.id)

if (!cadeira) { console.error('Cadeira Athenas não encontrada'); db.close(); process.exit(1) }

// Atualizar Cadeira Athenas → Mesa & Cadeira Athenas com todas as imagens
db.prepare('UPDATE produtos SET nome = ?, imagens = ? WHERE id = ?').run(
  'Mesa & Cadeira Athenas',
  JSON.stringify(imagens),
  cadeira.id
)
console.log(`\nProduto ${cadeira.id} renomeado para "Mesa & Cadeira Athenas" com ${imagens.length} imagens`)

// Remover Mesa Athenas separada
if (mesa) {
  db.prepare('DELETE FROM produtos WHERE id = ?').run(mesa.id)
  console.log(`Produto ${mesa.id} (Mesa Athenas) removido`)
}

console.log('\nImagens na ordem:')
imagens.forEach((url, i) => console.log(`  ${i + 1}. ${decodeURIComponent(url.split('/').pop())}`))

db.close()
