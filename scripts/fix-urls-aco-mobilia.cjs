const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const CATALOG_PASTA = 'Aco Mobilia 2025-7'
const SRC_DIR  = `C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\${CATALOG_PASTA}\\imagens dos produtos`
const DEST_DIR = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)

fs.mkdirSync(DEST_DIR, { recursive: true })

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
const prods = db.prepare("SELECT id, nome, imagens FROM produtos WHERE catalogo_id = ?").all(cat.id)

let updated = 0
for (const p of prods) {
  let imgs = []
  try { imgs = JSON.parse(p.imagens || '[]') } catch {}
  if (!imgs.length) continue

  const novas = imgs.map(url => {
    // Já está no formato correto
    if (url.startsWith('/imagens/')) return url

    // Extrai o nome do arquivo da URL /api/imagem/...
    const parts = url.split('/')
    const filename = decodeURIComponent(parts[parts.length - 1])

    // Copia para public
    const srcFile  = path.join(SRC_DIR, filename)
    const destFile = path.join(DEST_DIR, filename)
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile)
      console.log(`  Copiado: ${filename}`)
    } else {
      console.warn(`  FALTANDO: ${filename}`)
    }

    return `/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(filename)}`
  })

  db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(novas), p.id)
  console.log(`[${p.id}] ${p.nome} -> ${novas.length} imagem(ns) corrigida(s)`)
  updated++
}

console.log(`\n${updated} produto(s) com URLs corrigidas.`)
db.close()
